const User = require('../models/user.model');
const Role = require('../models/role.model')
const mongoose = require('mongoose');
exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.findAllUsers = (req, res) => {
  User.find({}, { password: 0 }) 
  .populate('roles', '-__v') 
  .exec((err, users) => {
      if (err) {
          res.status(500).send({ message: err });
          return;
      }
      res.status(200).send(users);
  });
};



// Controller to change user's role


// exports.changeUserRoleById = async (req, res) => {
//   console.log("Starting changeUserRoleById function");
//  const { userId, roleId } = req.body; 
//   console.log("Received userId:", userId);
//   console.log("Received roleId:", roleId);
//   try {
//     console.log("Attempting to find role by ID");
//     // Validate the existence of the role
//     const role = await Role.findById(roleId);
//     console.log("Role search complete");
//     if (!role) {
//       console.log("Role does not exist.");
//       return res.status(404).send({ message: "Role does not exist." });
//     }
//     console.log("Attempting to update user's role");
//     // Update the user's role
//     const user = await User.findByIdAndUpdate(
//       userId,
//       { $set: { roles: [roleId] } },
//       { new: true }
//     ).populate("roles", "-__v");
//     console.log("User update attempt complete");
//     if (!user) {
//       console.log("User not found.");
//       return res.status(404).send({ message: "User not found." });
//     }
//     console.log("User role updated successfully:", user);
//     res.status(200).send({ message: "User role updated successfully.", user });
//   } catch (error) {
//     console.log("Error occurred during role update:", error);
//     res.status(500).send({ message: error.message });
//   }
// };

exports.changeUserRoleById = async (req, res) => {
  const { userId, roleId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(roleId)) {
    return res.status(400).send({ message: "Invalid user ID or role ID." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    if (user.isInitialAdmin) {
      return res.status(403).send({ message: "Cannot change role of the initial admin." });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).send({ message: "Role does not exist." });
    }

    user.roles = [roleId];
    const updatedUser = await user.save();

    res.status(200).send({ message: "User role updated successfully.", user: updatedUser });
  } catch (error) {
    res.status(500).send({ message: "An error occurred while updating the user role.", error: error.message });
  }
};







// exports.changeUserRoleById = async (req, res) => {
//   console.log("This route has been hit");
//   res.status(200).send("Route is working");
// };

