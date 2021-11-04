const express = require("express");
const router = express.Router();
const posts = require("../models/Post");
const users = require("../models/users");
const path = require('path');
const fs = require('fs');
const session = require("express-session");
const crypto = require("crypto");
const multer = require("multer");
const cloudinary = require("../classes/cloudinary");
const Podcast = require("../models/Podcast");

router.use (
  session ({
      secret: "Stride",
      resave: true,
      saveUninitialized: false,
      cookie: {}
  })
);

    const storage = multer.diskStorage({
        filename: (req, file, cb) => {
          const fileExt = file.originalname.split(".").pop();
          const filename = `${new Date().getTime()}.${fileExt}`;
          cb(null, filename);
    }
});

  // Filter the file to validate if it meets the required video extension
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === "audio/mp3" || file.mimetype === "audio/mpeg") {
      cb(null, true);
    } else { 
      cb(
        {
          message: "Unsupported File Format",
        },
        false
      );
    }
  };

  const upload = multer({
    storage,
    limits: {
      fieldNameSize: 200,
      fileSize: 30 * 1024 * 1024,
    },
    fileFilter,
  }).single("audio");




//GET create Videos
router.get('/', async (req, res) => {
    const podcasts = await Podcast.find().populate('user').lean().sort({ created: 'desc' })
        res.render('podcast_index',{
            user : req.user,
            podcasts,
            title: 'Podcasts | Stride Connect'
        });
});

//GET create new post
router.get('/create', isLoggedIn, (req, res) => {
        res.render('create_new_podcast', { title: 'New Podcast | Stride Connect', user: req.user });
});

//POST new post
router.post('/create', isLoggedIn, async (req, res) => {
    
    console.log(req.body);
});


//@desc Get Single Video
//@route /posts/:id
router.get("/:id", async(req, res) => {
  const url = req.url;
  try {
      const podcast = await Podcast.findById(req.params.id).populate('user').lean()
  
      res.render('single_podcast', {
          podcast,
          user: req.user,
          title: `Stride Connect`,
          url: `https://stride-connect.herokuapp.com/videos${url}`
      })
    } 
    catch (err) {
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