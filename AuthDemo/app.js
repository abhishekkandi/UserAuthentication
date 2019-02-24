const express               = require("express"),
      mongoose              = require("mongoose"),
      passport              = require("passport"),
      bodyParser            = require("body-parser"),
      LocalStrategy         = require("passport-local"),
      User                  = require("./models/user"),
      app                   = express(),
      portNumber            = 3000;

app.use(require("express-session")({
    secret: "I'm being used for encoding & decoding session!",
    resave: false,
    saveUninitialized: false
}));

mongoose.connect("mongodb://localhost:27017/auth_demo_app", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
//Enncoding & Decoding the user details from session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//===========================================
//ROUTES
//===========================================

app.get("/", function(req, res){
    res.render("home");
});

app.get("/secret", isUserLoggedIn, function(req,res){
    res.render("secret");
});

//AUTH Routes

//For showing Sign up form
app.get("/register", function(req, res){
    res.render("register");
});

//Handling user sign up
app.post("/register", function(req,res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secret");
        });
    });
});

// LOGIN ROUTES
//Render Login form
app.get("/login", function(req,res){
    res.render("login");
});

//logging in the user
//Used passport.authenticate() as a Middleware
app.post("/login", passport.authenticate("local",{ successRedirect: "/secret", failureRedirect: "/login" }), function(req, res){    
});

app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
});

function isUserLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(portNumber, function(){
    console.log(`Server started running at port - ${portNumber}`);
});
       