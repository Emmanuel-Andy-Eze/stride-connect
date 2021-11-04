'use strict'

const express = require("express");

const path = require("path");
const config = require("./config");
const { name, keys } = config.session;
const cookieSession = require('cookie-session');
const mongoose = require('mongoose');
const passport = require("passport")
const session = require("express-session");
const flash = require("connect-flash")
const dotenv = require("dotenv")

dotenv.config();

const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const videoRoute = require("./routes/videos");
const podcastRoute = require("./routes/podcasts");

//Initialize App
const app = express();

//Connect to mongoDb 
mongoose
  .connect('mongodb+srv://3rive:chexyemma8@cluster0.q5uio.mongodb.net/Stride-Connect?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongoDB is connected"))
  .catch((err) => console.log(err)); 

//Set View engine
app.set('view engine', 'ejs');
app.locals.moment = require('moment');

//Set Public Folder
app.use('/public', express.static(path.join(__dirname, 'public')));

//Body parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(session({secret : 'strideconnect', saveUninitialized: true, resave: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);
require('./routes/index')(app,passport);

app.use("/users/", userRoute);
app.use("/posts/", postRoute);
app.use("/videos/", videoRoute);
app.use("/podcasts", podcastRoute);

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`Server running in port: ${port}`)
})