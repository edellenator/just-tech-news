const router = require('express').Router();

const { User, Post, Vote } = require('../../models');

// Get api/users
router.get('/', (req, res) => {
    // Access our user model and run findAll() method from sequelize model class
    User.findAll({
        attributes: {
            exclude: ['password']
        }
    }).then(dbUserData => res.json(dbUserData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

// Get api/users/1
router.get('/:id', (req, res) => {
    // Access our user model based on id using findOne method from sequelize model class
    User.findOne({
        attributes: { exclude: ['password'] },
        where: { id: req.params.id },
        include: [
            {
              model: Post,
              attributes: ['id', 'title', 'post_url', 'created_at']
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'created_at'],
                include: {
                  model: Post,
                  attributes: ['title']
                }
            },
            {
              model: Post,
              attributes: ['title'],
              through: Vote,
              as: 'voted_posts'
            }
          ]
    }).then(dbUserData => {
        if (!dbUserData) {
            res.status(404).json({message: 'No user found wth this id'});
            return;
        }
        res.json(dbUserData);
    }).catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
        
});

// Post api/users
router.post('/', (req, res) => {
    //expects {username: 'xxxx', email: 'yyyy@email.com', password: 'passlongerthan4characters' }
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }).then(dbUserData => {
        req.session.save(() => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
        
            res.json(dbUserData);
        });
    })
      .catch(err => {
          console.log(err);
          res.status(500).json(err);
    })
});

router.post('/login', (req, res) => {
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(dbUserData => {
      if (!dbUserData) {
        res.status(400).json({ message: 'No user with that email address!' });
        return;
      }
  
      const validPassword = dbUserData.checkPassword(req.body.password);
  
      if (!validPassword) {
        res.status(400).json({ message: 'Incorrect password!' });
        return;
      }
  
      req.session.save(() => {
        // declare session variables
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;
  
        res.json({ user: dbUserData, message: 'You are now logged in!' });
      });
    });
  });

router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
          res.status(204).end();
        });
    }
    else {
       res.status(404).end();
    }
});


// Put api/users/1
router.put('/:id', (req, res) => {
    // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}

    // if req.body has exact key/value pairs to match the model, you can just use `req.body` instead
    User.update(req.body, {
        individualHooks: true,
        where: {
            id: req.params.id
        }
    }).then(dbUserData => {
        if (!dbUserData[0]) {
            res.status(404).json({message: 'No user with this id found'});
            return;
        }
        res.json(dbUserData);
    }).catch(err => {
        console.log(err);
        res.status(500).json(err);
    })

});

// Delete api/users/1
router.delete('/:id', (req, res) => {
    User.destroy({
        where: {
            id: req.params.id
        }
    }).then(dbUserData => {
        if (!dbUserData) {
            res.status(404).json({message: 'No user with this id found'});
            return;
        }
        res.json(dbUserData);
    }).catch(err => {
        console.log(err);
        res.status(500).json(err);
    })

});

module.exports = router;