var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
 
var options = {
auth: {
api_user: 'sendgrid_username',
api_key: 'sendgrid_password'
}
}
var client = nodemailer.createTransport(sgTransport(options));
exports.client = client;
