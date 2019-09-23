const express = require('express');
const router = express.Router();
const User = require('../model/User');
const Contact = require('../model/Contact');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const authToken = require('../middleware/auth');
const { check, validationResult } = require('express-validator');


router.get('/', authToken, async (req, res) => {
    try {
        const contacts = await Contact.find({ user: req.user.id }).sort({ date: -1 });
        res.send(contacts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }

})

router.post('/', [authToken, [
    check('name', "Name is Required").not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, phone, type } = req.body;
    try {
        const newContact = new Contact({
            name: name,
            email: email,
            phone: phone,
            type: type,
            user: req.user.id
        });
        const contact = await newContact.save();
        res.json(contact);

    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error")
    }

})


router.put('/:id', authToken, async (req, res) => {

    const { name, email, phone, type } = req.body;

    //Building Contact Object......
    const contactObject = {};
    if (name) contactObject.name = name;
    if (email) contactObject.email = email;
    if (phone) contactObject.phone = phone;
    if (type) contactObject.type = type;

    try {
        let contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ msg: "Contact not Found" });

        //Make Sure user owns contact
        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "Unauthorized" })
        }

        contact = await Contact.findByIdAndUpdate(req.params.id,
            { $set: contactObject },
            { new: true });
        res.json(contact);

    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error")
    }



})


router.delete('/:id', authToken, async (req, res) => {
    try {
        let contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ msg: "Contact not Found" });

        //Make Sure user owns contact
        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "Unauthorized" })
        }

        await Contact.findByIdAndRemove(req.params.id);

        res.json({ msg: "Cotact Deleted" });

    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server Error");
    }
})



module.exports = router;