const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({
    title: {
        type: String
    },
    body: {
        type: String
    }, 
    category: {
        type: String
    },
    description: {
        type: String
    },
    image: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    }
}
);

module.exports = mongoose.model("Post", PostSchema);