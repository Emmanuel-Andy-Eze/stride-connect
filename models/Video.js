const mongoose = require("mongoose")

const VideoSchema = new mongoose.Schema({
    title: {
        type: String
    },
    category: {
        type: String
    },
    video: String,
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

module.exports = mongoose.model("Video", VideoSchema);