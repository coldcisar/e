const express = require('express');
const {check, validationResult, body} = require('express-validator');
const router = express.Router();
const helper = require('../config/helpers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// LOGIN ROUTE

router.post('/login', [helper.hasAuthFields, helper.isPasswordAndUserMatch], (req, res) => {
    // El usuario completo ahora está disponible en req.user gracias al middleware
    const user = req.user;

    // Creamos el token con más información útil
    let token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email }, // Usamos 'id' de la BD
        helper.secret, 
        { expiresIn: '4h' }
    );

    // Enviamos una respuesta JSON con TODOS los datos que el frontend necesita
    res.json({
        token: token, 
        auth: true, 
        email: user.email, 
        username: user.username,
        fname: user.fname,
        lname: user.lname,
        photoUrl: user.photoUrl,
        userId: user.id // Usamos 'id' de la BD
    });
});

// REGISTER ROUTE
router.post('/register', [
    check('email').isEmail().not().isEmpty().withMessage('Field can\'t be empty')
        .normalizeEmail({all_lowercase: true}),
    check('password').escape().trim().not().isEmpty().withMessage('Field can\'t be empty')
        .isLength({min: 6}).withMessage("must be 6 characters long"),
    body('email').custom(value => {
        return helper.database.table('user').filter({
            $or:
                [
                    {email: value}, {username: value.split("@")[0]}
                ]
        }).get().then(user => {
            if (user) {
                console.log(user);
                return Promise.reject('Email / Username already exists, choose another one.');
            }
        })
    })
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    } else {

        let email = req.body.email;
        let username = email.split("@")[0];
        let password = await bcrypt.hash(req.body.password, 10);
        let fname = req.body.fname;
        let lname = req.body.lname;

        /**
         * ROLE 777 = ADMIN
         * ROLE 555 = CUSTOMER
         **/
        helper.database.table('user').insert({
            username: username,
            password: password,
            email: email,
            role: 555,
            lname: lname || null,
            fname: fname || null
        }).then(result => {
           
            if (result.insertId > 0) {
                res.status(201).json({message: 'Registration successful.'});
            } else {
                res.status(501).json({message: 'Registration failed.'});
            }
        }).catch(err => res.status(433).json({error: err}));
    }
});


module.exports = router;