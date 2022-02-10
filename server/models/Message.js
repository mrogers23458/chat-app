const { Schema, model } = require('mongoose');

const messageSchema = new Schema (
    {
        user: String,
        text: String
    }
)

const Message = model('Message', messageSchema)
module.exports = Message