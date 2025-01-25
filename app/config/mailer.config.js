const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: "ahmedovadel94@gmail.com",
    pass: "mmlk ovmi kegr pybo"
  }
});

module.exports = transporter;