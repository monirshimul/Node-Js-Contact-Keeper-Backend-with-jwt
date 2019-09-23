const mongoose = require('mongoose');
const ContactSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true

    },
    phone: {
        type: String

    },
    type: {
        type: String,
        default: "personal"
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const ContactModel = mongoose.model('contact', ContactSchema);

module.exports = ContactModel;
