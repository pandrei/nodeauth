# Nodeauth
Node.js skeleton app with authentication

The application is largely based on this
[Scotch IO Easy Node Authentication: Setup and Local tutorial](https://scotch.io/tutorials/easy-node-authentication-setup-and-local)

extended with e-mail account activation and e-mail password reset.

* e-mail middleware is provided by [nodemailer](https://github.com/andris9/Nodemailer)
* SMTP service provided by [Sendgrid](https://sendgrid.com/)
* MongoDB services provided by [Mongolab](https://mongolab.com/)


Nodemailer is a stable module that I personally found very simple to use, having comprehensive documentation.
Sendgrid offers a 400 mails a day free plan which I found ideal for development
Mongolab also has a free plan for a 500mb mongodb node that I found sufficient.

To install the app, you have have npm installed, then you simply do 
```npm install```

#Nodeauth logic

Local login is handled by passport, in the passport strategy, 
each time an account is created an activation e-mail is also generated and sent to user's email.
So far, the app does not support ```resend activation email``` it will be added on a TODO list.

the routes added for reset generate a token that's active 24 hours.
the ```get``` function simply renders the reset template, while the ```post```  updates the internal DB fields(reset token and reset token expiration date)
the password reset itself is done via the pwreset route.


#Disclaimer
I'm not a node expert, this is just something I've done in my free time, mainly because I have been looking for something like this
and I wasn't able to find it. Any feedback is welcomed, just keep in mind this is only intended to help whomever it can.

This is a live exampe of it : 
https://ziepher-andrei-1.c9.io/
