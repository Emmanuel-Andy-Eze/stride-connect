const express = require("express");
const router = express.Router();
const posts = require("../models/Post");
const users = require("../models/users");
const path = require('path');
const fs = require('fs');
const crypto = require("crypto");
const multer = require("multer");
const cloudinary = require("../classes/cloudinary");
const Videos = require("../models/Video");
const { video } = require("../classes/cloudinary");


    const storage = multer.diskStorage({
        filename: (req, file, cb) => {
          const fileExt = file.originalname.split(".").pop();
          const filename = `${new Date().getTime()}.${fileExt}`;
          cb(null, filename);
    }
});

  // Filter the file to validate if it meets the required video extension
  const fileFilter = (req, file, cb) => {
    if (file.mimetype === "video/mp4") {
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
  }).single("video");

  



//GET create Videos
router.get('/', async (req, res) => {
    const videos = await Videos.find().populate('user').lean().sort({ created: 'desc' })
        res.render('video_index',{
            user : req.user,
            videos,
            title: 'Videos | Stride Connect'
        });
});

//GET create new post
router.get('/create', isLoggedIn, (req, res) => {
        res.render('create_new_video', { title: 'New Video | Stride Connect', user: req.user });
});

//POST new post
router.post('/create', isLoggedIn, upload, async (req, res) => {
    const { path } = req.file; // file becomes available in req at this point

    const fName = req.file.originalname.split(".")[0];
    cloudinary.uploader.upload(
      path,
      {
        resource_type: "video",
        public_id: `VideoUploads/${fName}`,
        chunk_size: 6000000
      },

      // Send cloudinary response or catch error
      async(err, video) => {
        if (err) return res.send(err);

        fs.unlinkSync(path);
        const result = video.secure_url;
        req.body.user = req.user.id
        const newVideo = new Videos({
            description: req.body.description,
            title: req.body.title,
            category: req.body.category,
            created: req.body.created,
            video: result,
            user: req.body.user
        }); 
    
        await newVideo.save().then(video => {
            users.updateOne(
                {_id: req.user._id}, 
                {$push: {videos: video}},{new: true, upsert: true }).exec();
                res.redirect('/videos')
        })
      }
    );
});


//@desc Get Single Video
//@route /posts/:id
router.get("/:id", async(req, res) => {
  const url = req.url;
  try {
      const video = await Videos.findById(req.params.id).populate('user').lean()
  
      res.render('single_video', {
          video,
          user: req.user,
          title: `Stride Connect`,
          url: `https://stride-connect.herokuapp.com/videos${url}`
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