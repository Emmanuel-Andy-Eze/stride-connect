const express = require("express");
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require("crypto");
const users = require("../models/users");
const Post = require("../models/Post");
const multer = require("multer");
const { update } = require("../models/users");
const cloudinary = require("../classes/cloudinary");
const upload = require("../classes/multer")



router.get('/profile/:username', isLoggedIn, async (req, res, next) => {
    const { username } = req.params;
    try {
        const user = await users.findOne({ username: username });
        const posts = await Post.find({ user: req.user.id }).populate('user').lean().sort({ created: 'desc' })
        if(user) {
            res.render('profile',{
                title: `${username} | Stride Connect`,
                user,
                posts
            });
        } else {
            res.sendStatus(404);
        }
    } catch(err) {
        console.log(err);
        res.sendStatus(500); 
    }
});

//GET Edit User Profile
router.get('/profile/:username/edit', isLoggedIn, async (req, res, next) => {
    const { username } = req.params;
    try {
        const user = await users.findOne({ username: username });
        if(user) {
            res.render('edit',{
                title: `${username} | Stride Connect`,
                user: user
            });
        } else {
            res.sendStatus(404);
        }
    } catch(err) {
        res.sendStatus(500); 
    }
});

//EDIT USER
router.post('/profile/:username/edit', upload.single('image'), isLoggedIn, async (req, res, next) => {
        const { username } = req.params;
        const result = await cloudinary.uploader.upload(req.file.path);
        let userUpdate = users.findByIdAndUpdate(req.body.id, {
            id: req.body.id,
            name: req.body.name,
            description: req.body.description,
            username: req.body.username,
            email: req.body.email,
            image: result.secure_url
        });
        userUpdate.exec(function(err, data) {
            if(err) throw err;
            res.redirect('/')
        })
});

//FOLLOW USER
router.post('/follow', async (req, res, next) => {
    const { followers, following, action } = req.body;
    try {
        switch(action) {
            case 'follow':
                await Promise.all([ 
                    users.findOneAndUpdate(followers, { $push: { following: following }}),
                    users.findOneAndUpdate(following, { $push: { followers: followers }})
                
                ]);
            break;

            case 'unfollow':
                await Promise.all([ 
                    users.findOneAndUpdate(followers, { $pull: { following: following }}),
                    users.findOneAndUpdate(following, { $pull: { followers: followers }})
                
                ]); 
            break;

            default:
                break;
        }

        res.json({ done: true });
        
    } catch(err) {
        res.json({ done: false });
    }
});

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}

module.exports = router;