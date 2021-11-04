const mongoose = require("mongoose")

const podcastSchema = new mongoose.Schema({
    title: {
        type: String
    },
    category: {
        type: String
    },
    audio: String,
    description: {
        type: String
    },
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

module.exports = mongoose.model("Podcast", podcastSchema);