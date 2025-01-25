const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// exports.signup = (req, res) => {
//   const user = new User({
//     username: req.body.username,
//     email: req.body.email,
//     password: bcrypt.hashSync(req.body.password, 8)
//   });

//   user.save((err, user) => {
//     if (err) {
//       res.status(500).send({ message: err });
//       return;
//     }

//     if (req.body.roles) {
//       Role.find(
//         {
//           name: { $in: req.body.roles }
//         },
//         (err, roles) => {
//           if (err) {
//             res.status(500).send({ message: err });
//             return;
//           }

//           user.roles = roles.map(role => role._id);
//           user.save(err => {
//             if (err) {
//               res.status(500).send({ message: err });
//               return;
//             }

//             res.send({ message: "User was registered successfully!" });
//           });
//         }
//       );
//     } else {
//       Role.findOne({ name: "user" }, (err, role) => {
//         if (err) {
//           res.status(500).send({ message: err });
//           return;
//         }

//         user.roles = [role._id];
//         user.save(err => {
//           if (err) {
//             res.status(500).send({ message: err });
//             return;
//           }

//           res.send({ message: "User was registered successfully!" });
//         });
//       });
//     }
//   });
// };

// exports.signup = (req, res) => {
//   const user = new User({
//     username: req.body.username,
//     email: req.body.email,
//     password: bcrypt.hashSync(req.body.password, 8)
//   });

//   User.countDocuments({}, (err, count) => {
//     if (err) {
//       res.status(500).send({ message: err });
//       return;
//     }

//     if (count === 0) {
//       //Mokles  Il s'agit du premier utilisateur, assignons-lui le rôle 'admin'
//       Role.findOne({ name: "admin" }, (err, role) => {
//         if (err) {
//           res.status(500).send({ message: err });
//           return;
//         }

//         user.roles = [role._id];
//         user.save(err => {
//           if (err) {
//             res.status(500).send({ message: err });
//             return;
//           }

//           res.send({ message: "Admin was registered successfully!" });
//         });
//       });
//     } else {
//       // Mokles Il ne s'agit pas du premier utilisateur, assignons-lui le rôle 'user'
//       Role.findOne({ name: "user" }, (err, role) => {
//         if (err) {
//           res.status(500).send({ message: err });
//           return;
//         }

//         user.roles = [role._id];
//         user.save(err => {
//           if (err) {
//             res.status(500).send({ message: err });
//             return;
//           }

//           res.send({ message: "User was registered successfully!" });
//         });
//       });
//     }
//   });
// };

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  User.countDocuments({}, (err, count) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (count === 0) {  // First user
      user.isInitialAdmin = true;  // Set the flag to true
      Role.findOne({ name: "admin" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "Admin was registered successfully!" });
        });
      });
    } else {  // Subsequent users
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};


exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      const token = jwt.sign({ id: user.id },
                              config.secret,
                              {
                                algorithm: 'HS256',
                                allowInsecureKeySizes: true,
                                expiresIn: 86400, // 24 hours
                              });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
    });
};



const transporter = require('../config/mailer.config');
const crypto = require("crypto");


exports.forgotPassword = (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err || !user) {
      return res.status(400).send({ message: "User with this email does not exist." });
    }

    // Generate a reset token
    const token = crypto.randomBytes(20).toString('hex');

    // Set the reset token and expiration
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    user.save((err) => {
      if (err) {
        return res.status(500).send({ message: "Error saving user reset token." });
      }

      // Email reset link
      const mailOptions = {
        to: user.email,
        from: `Contact BRIMA SOUK <ganeshcodingoffice@gmail.com>`,
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
              `Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n` +
              `http://192.168.1.50:8000/reset-password/${token}\n\n` +
              `If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error("Error sending the email:", err); 
          return res.status(500).send({ message: "Error sending the email." });
        }

        res.status(200).send({ token:token });
      });
    });
  });
};



exports.resetPassword = (req, res) => {
  console.log("Reset password token:", req.params.token); // Log the incoming token

  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  }, (err, user) => {
    if (err) {
      return res.status(500).send({ message: "Server error." });
    }
    
    if (!user) {
      console.log("No user found or token expired."); // Log when no user is found
      return res.status(400).send({ message: "Password reset token is invalid or has expired." });
    }

    if (!req.body.password) {
      return res.status(400).send({ message: "Password is required." });
    }

    // Save the new password
    user.password = bcrypt.hashSync(req.body.password, 8);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    user.save((err) => {
      if (err) {
        return res.status(500).send({ message: "Error saving the new password." });
      }
      res.status(200).send({ message: "Password has been reset successfully!" });
    });
  });
};




