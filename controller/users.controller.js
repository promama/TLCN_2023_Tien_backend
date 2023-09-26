const User = require("../model/users");
const Cart = require("../model/carts");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.test = async (req, res) => {
  var users = await User.find();
  if (users.length == 0) {
    res.json({
      message: "no user found",
    });
  } else {
    res.json({
      users,
    });
  }
};

module.exports.createAccount = (req, res) => {
  if (
    req.body.email == "" ||
    req.body.password == "" ||
    req.body.repassword == ""
  ) {
    res.status(400).json({
      success: false,
      message: "please fill all field",
    });
  } else {
    if (req.body.password === req.body.repassword) {
      User.find({ email: req.body.email })
        .exec()
        .then((user) => {
          //check if email already existed
          if (user.length > 0) {
            res.status(409).json({
              success: false,
              message: "email existed",
            });
          } else {
            //hash password
            bcrypt.hash(req.body.password, 10, (err, hashed) => {
              if (err) {
                res.status(500).json({
                  success: false,
                  message: err,
                });
              } else {
                //create a new user with email and password being hash
                const user = new User({
                  _id: new mongoose.Types.ObjectId(),
                  email: req.body.email,
                  password: hashed,
                });

                //create cart with userId
                const cart = new Cart({
                  _id: new mongoose.Types.ObjectId(),
                  userId: user._id,
                });

                cart.save().then((result) => {
                  console.log(result);
                });

                user
                  .save()
                  .then((result) => {
                    console.log(result);
                    res.status(201).json({
                      success: true,
                      data: {
                        email: user.email,
                      },
                      message: "create user success!",
                    });
                  })
                  .catch((err) => {
                    res.status(500).json({
                      success: false,
                      message: "email format is not correct",
                    });
                  });
              }
            });
          }
        });
    } else {
      res.status(400).json({
        success: false,
        message: "password and repassword not match!",
      });
    }
  }
};
