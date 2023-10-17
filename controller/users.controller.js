const User = require("../model/users");
const Cart = require("../model/carts");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

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

module.exports.loginAccount = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const haveEmailPassword = checkTypedEmailPassword(email, password);
  var matchedPassword = false;

  if (haveEmailPassword) {
    const user = await User.find({ email }).exec();
    if (user.length > 0) {
      const matched = await compareHashedPassword(password, user[0].password);
      if (matched) {
        //create refresh token with time limit: 1day
        const refreshToken = jwt.sign(
          {
            email: user[0].email,
            role: user[0].role,
            status: user[0].status,
          },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );
        //create access token with time limit: 5mins
        const token = jwt.sign(
          { email: user[0].email },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "5m" }
        );
        //find user and update refresh token
        await User.findOneAndUpdate({ email }, { refreshToken });
        res.status(201).json({
          success: true,
          message: "login success",
          email,
          token,
        });
      } else {
        res.status(401).json({
          success: false,
          message: "wrong password",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "no user found",
      });
    }
  } else {
    console.log("email: " + email + "/npassword: " + password);
    res.status(400).json({
      success: false,
      message: "please enter your email and password",
    });
  }

  // if (haveEmailPassword) {
  //   User.find({ email })
  //     .exec()
  //     .then((user) => {
  //       if (user.length > 0) {
  //         bcrypt.compare(password, user[0].password, (err, matched) => {
  //           if (err) {
  //             return res.status(400).json({
  //               success: false,
  //               message: err,
  //             });
  //           }
  //           if (matched) {
  //             //create refresh token with time limit: 1day
  //             const refreshToken = jwt.sign(
  //               {
  //                 email: user[0].email,
  //                 role: user[0].role,
  //                 status: user[0].status,
  //               },
  //               process.env.REFRESH_TOKEN_SECRET,
  //               { expiresIn: "1d" }
  //             );

  //             //create access token with time limit: 5mins
  //             const token = jwt.sign(
  //               { email: user[0].email },
  //               process.env.ACCESS_TOKEN_SECRET,
  //               { expiresIn: "5m" }
  //             );

  //             //find user and update refresh token
  //             User.findOneAndUpdate({ email }, { refreshToken });
  //             console.log(token);
  //             console.log(refreshToken);
  //             res.status(201).json({
  //               success: true,
  //               message: "login success",
  //               token,
  //             });
  //           } else {
  //             res.status(401).json({
  //               success: false,
  //               message: "wrong password",
  //             });
  //           }
  //         });
  //       } else {
  //         res.status(400).json({
  //           success: false,
  //           message: "no user found",
  //         });
  //       }
  //     });
  // } else {
  //   console.log("email: " + email + "/npassword: " + password);
  //   res.status(400).json({
  //     success: false,
  //     message: "please enter your email and password",
  //   });
  // }
};

//input password from front end and password from database
//then compare and return result
async function compareHashedPassword(reqPassword, dbPassword) {
  var result;
  try {
    result = await bcrypt.compare(reqPassword, dbPassword);
  } catch (err) {
    return {
      success: false,
      message: err,
    };
  }
  return result;
}

//input email and password
//check if user enter email and password
//return false if any null or "", return true if all typed
function checkTypedEmailPassword(email, password) {
  if (email == null || password == null || email == "" || password == "") {
    return false;
  } else {
    return true;
  }
}

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
