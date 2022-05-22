const router = require('express').Router();

const { User } = require('../../models');

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
        where: { id: req.params.id }
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
    }).then(dbUserData => res.json(dbUserData))
      .catch(err => {
          console.log(err);
          res.status(500).json(err);
      })
});

// Put api/users/1
router.put('/:id', (req, res) => {
    // expects {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}

    // if req.body has exact key/value pairs to match the model, you can just use `req.body` instead
    User.update(req.body, {
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