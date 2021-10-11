const express = require("express");
const router = express.Router();
const posts = require("../models/Post");
const users = require("../models/users");
const path = require('path');
const fs = require('fs');
const crypto = require("crypto");
const multer = require("multer");
const cloudinary = require("../classes/cloudinary");
const upload = require("../classes/multer")
var moment = require('moment');

exports.index = function(req, res) {
    // send moment to your ejs
    res.render('index', { moment: moment });
}

//GET create new post
router.get('/create', isLoggedIn, (req, res) => {
        res.render('create_post', { title: 'New Post | Express Instagram', user: req.user });
});

//POST new post
router.post('/create', isLoggedIn, upload.single('image'), async (req, res) => {
    req.body.user = req.user.id
    const result = await cloudinary.uploader.upload(req.file.path);
    const newPost = new posts({
        description: req.body.description,
        title: req.body.title,
        body: req.body.body,
        created: req.body.created,
        image: result.secure_url,
        category: req.body.category,
        user: req.body.user
    }); 

    await newPost.save().then(post => {
        users.updateOne(
            {_id: req.user._id}, 
            {$push: {posts: post}},{new: true, upsert: true }).exec();
            res.redirect('/')
    })
});

// @desc    Delete story
// @route   DELETE /post/:id
router.get('/:id/delete', isLoggedIn, async (req, res) => {
    const { username } = req.user;
    try {
      let post = await posts.findById(req.params.id).lean()
  
      if (post.user != req.user.id) {
        res.redirect('/')
      } else {
        await posts.remove({ _id: req.params.id })
        res.redirect(`/users/profile/${username}`)
      }
    } catch (err) {
      console.error(err)
      return res.render('error/500')
    }
})

//@desc Get Single Post
//@route /posts/:id
router.get("/:id", async(req, res) => {
    const url = req.url;
    try {
        const post = await posts.findById(req.params.id).populate('user').lean()
    
        res.render('single_post', {
            post,
            user: req.user,
            title: `Stride Connect`,
            url: `https://www.localhost:4000/posts${url}`
        })

      } catch (err) {
        console.error(err)
        res.render('error/404')
      }
})

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}


module.exports = router;