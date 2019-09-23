const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const config = require('config');

const { check, validationResult } = require('express-validator');


router.post('/',
    [
        check('name', 'Name is Required').not().isEmpty(),
        check('email', "Please provide a valid Email").isEmail(),
        check('password', 'Please enter pass with 6 or more charc ').isLength({ min: 6 })

    ],



    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }



        const { name, email, password } = req.body
        try {
            let user = await User.findOne({ email: email })
            if (user) {
                return res.status(400).json({ message: "User already exists" });
            }
            user = new User({
                name: name,
                email: email,
                password: password
            })

            //bcrypt password.....
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt)
            await user.save();


            //jwt initialize......
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload, config.get('jwtSecret'), {
                expiresIn: 360000
            }, (err, token) => {
                if (err) throw err;
                res.json({ token })
            })

        } catch (err) {
            console.error(err.message)
            res.status(500).send("server error")
        }
    })



module.exports = router;