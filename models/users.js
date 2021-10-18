'use strict';

const mongoose  = require('mongoose');
const bcrypt = require("bcrypt-nodejs");
const { Schema }  = mongoose;

const UserSchema = new Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    url: { type: String, default: '' },
    image: { type: String, default: 'https://res.cloudinary.com/dg0lat2d3/image/upload/v1633949392/1200px-User_font_awesome.svg_tj8u4x.png' },
    description: { type: String, default: '' },
    posts: Array,
    videos: Array,
    followers: Array,
    following: Array

},{collection: 'users'});

UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);