const express = require('express');
const router = express.Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const authToken = require('../middleware/auth');
const { check, validationResult } = require('express-validator');


router.get('/', authToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            username: user.name,
            email: user.email
        });
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error");
    }
})

router.post('/', [
    check('email', "Please include a valid email").isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }



    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ msg: "Invalid Credential" });
        }
        //Matching Password
        const passMatch = await bcrypt.compare(password, user.password)
        if (!passMatch) {
            return res.status(400).json({ msg: "Invalid Credential" })
        }

        //jwt initialize......
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token })
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})



module.exports = router;