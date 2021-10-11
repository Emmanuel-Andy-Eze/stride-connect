'use strict'

const express = require("express");
const port = process.env.PORT || 4000
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

//Initialize App
const app = express();

//Connect to mongoDb
mongoose
  .connect(process.env.MONGO_URI, {
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

app.listen(port, () => {
    console.log(`Server running in port: ${port}`)
})