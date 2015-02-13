// app/routes.js

var crypto          = require('crypto');
var moment          = require('moment');
var mailer          = require('../mailer/email.js');
var User            = require('./models/user');

module.exports = function(app, passport) {
    
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // PASSWORD RESET ======================
    // =====================================
    // show the reset form
    app.get('/reset', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('reset.ejs', {message : req.flash('')});
        
    });
    

    app.post('/reset', function(req, res) {
        var err;
        var msg;
        
        User.findOne ({ 'local.email' :  req.body.email }, function(err, user) {
            // if there are any errors, return the error before anything else

            if(err) {
                console.log(err);
                return err;
            }
            // if no user is found, return the message
            if (!user) {
                msg = 'No user found.';
                return res.render('reset.ejs', {
                    message : msg
                });
            }
            
            console.log(user);

            var unID = crypto.randomBytes(20).toString('hex');
            
            var email = {
                from: 'test@nodeauth.com',
                to: req.body.email,
                subject: 'Hello',
                text: 'Click on <your_website_url>/pwreset/' + unID +
                ' to reset your password!'
            };    

            user.local.resetToken = unID;
            user.local.resetTokenExpires = moment().add(24, 'hours');
            user.save();

            
            console.log("user token " + user.local.resetToken);
            console.log("user reset token expires " + user.local.resetTokenExpires);
            // all is well, return successful user
            msg = 'password succesfully reseted for ' + req.body.email;
            
            mailer.client.sendMail(email, function(err, info){
                if (err){
                    console.log(err);
                    return err;
                }
                else {
                    console.log('Message sent: ' + info.response);
                }
            }); 
            res.render('reseted.ejs', {
                message : msg
            });
        });
    });
    
    
    app.get('/pwreset/:token', function(req, res) {
        User.findOne({ 'local.resetToken' : req.params.token}, function(err, user) {
        if(err) {
            console.log(err);
            return err;
        }
        if (!user) {
            var msg = 'Password reset token is invalid or has expired.';
            return res.render('reseted.ejs', {
                message : msg
            });
        }
        var msg = '';

        return res.render('pwreset', {
          user      : user,
          message   : msg
        });
        });
    });
    
    app.post('/pwreset', function(req, res) {
        User.findOne ({ 'local.email' :  req.body.email }, function(err, user) {
            if(err) {
                console.log(err);
                return err;
            }
            if(!user) {
                res.render('login.ejs', {message: 'Cannot reset, user does not exist!'});
            }
            user.local.password = user.generateHash(req.body.password);
            user.local.resetToken = null;
            user.local.resetTokenExpires = null;
            user.save();
            res.render('login.ejs', {message: 'Password reseted succesfully! Please login!'});
        });
    });
    
    
    
    // =====================================
    // ACCOUNT ACTIVATION ==================
    // =====================================
    
        app.get('/activate/:token', function(req, res) {
        User.findOne({ 'local.activationToken' : req.params.token}, function(err, user) {
        if (!user) {
            var msg = 'Activation token is invalid.';
            return res.render('index', {
                message : msg
            });
        }
        var msg = 'Account has been succesfully activated!';
        user.local.activated = true;
        user.local.activationToken = null;
        user.save();
        return res.render('login', {
          message   : msg
        });
        });
    });
    
    
    
    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}