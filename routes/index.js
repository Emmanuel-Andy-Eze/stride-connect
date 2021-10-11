module.exports = function(app,passport){
    const Post = require("../models/Post")

    app.get('/',async(req,res)=>{
        const posts = await Post.find().populate('user').lean().sort({ created: 'desc' })
        res.render('index',{
            user : req.user,
            posts,
            title: 'Articles | Stride Connect'
        });
    });

    app.get('/register',(req,res) => {
        res.render('register', {title: 'Register | Stride Connect'});
    })

    app.post('/register', passport.authenticate('local-signup', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/register', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get("/login", (req, res) => {
        res.render("login", {title: 'Login | Stride Connect'})
    })

      
    app.post(
        "/login",
        passport.authenticate("local-login", {
          successRedirect: "/",
          failureRedirect: "/login",
          failureFlash: true,
        })
      )

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


        // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated())
            return next();

        // if they aren't redirect them to the home page
        res.redirect('/login');
    }
}