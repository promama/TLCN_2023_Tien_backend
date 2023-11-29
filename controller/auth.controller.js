const User = require("../model/users");
const Cart = require("../model/carts");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

function verifyToken(token) {}

module.exports.verifyUser = async (req, res, next) => {
  let access_token = "";
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    access_token = req.headers.authorization.split(" ")[1];
  } else {
    return res.status(500).json({
      success: false,
      message: "header wrong",
    });
  }
  try {
    const accessTokenDecode = jwt.verify(
      access_token.toString(),
      process.env.ACCESS_TOKEN_SECRET
    );
    const userId = await User.find({ email: accessTokenDecode.email }, "_id");
    if (!userId) {
      return res.status(500).json({
        success: false,
        message: "no user found",
      });
    }
    req.body.userId = userId;
    console.log("using token");
    const cart = await Cart.find({ userId: userId[0]._id });
    if (!cart) {
      return res.status(500).json({
        success: false,
        message: "no cart found",
      });
    }
    console.log(cart[0]);
    req.body.cartInfos = cart[0];
    return next();
  } catch (err) {
    try {
      const refreshTokenDecode = jwt.verify(
        req.body.refresh_token,
        process.env.REFRESH_TOKEN_SECRET
      );
      const userId = await User.find(
        { email: refreshTokenDecode.email },
        "_id"
      );
      if (!userId) {
        return res.status(500).json({
          success: false,
          message: "no user found",
        });
      }
      //give a new token
      const token = jwt.sign(
        { email: userId[0].email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "10m" }
      );
      req.body.userId = userId;
      req.body.token = token;
      console.log("using refresh token");
      const cart = await Cart.find({ userId: userId[0]._id });
      if (!cart) {
        return res.status(500).json({
          success: false,
          message: "no cart found",
        });
      }
      console.log(cart[0]);
      req.body.cartInfos = cart[0];
      return next();
    } catch (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "signin again",
          error: err,
        });
      }
    }
  }
  return res.status(500).json({
    success: false,
    message: "signin again",
  });
};

//old
module.exports.averifyUser = async (req, res, next) => {
  let access_token = "";
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    access_token = req.headers.authorization.split(" ")[1];
    console.log(access_token);
    console.log("verifying");
    try {
      const accessTokenDecode = jwt.verify(
        access_token.toString(),
        process.env.ACCESS_TOKEN_SECRET
      );
      const userId = await User.find({ email: accessTokenDecode.email }, "_id");
      if (userId) {
        req.body.userId = userId;
        console.log("using token");
        const cart = await Cart.find({ userId: userId[0]._id });
        if (cart) {
          console.log(cart[0]);
          req.body.cartInfos = cart[0];
          next();
        } else {
          console.log("no cart found");
        }
      } else {
        console.log("no user found");
      }
    } catch (err) {
      if (err) {
        try {
          const refreshTokenDecode = jwt.verify(
            req.body.refresh_token,
            process.env.REFRESH_TOKEN_SECRET
          );
          const userId = await User.find(
            { email: refreshTokenDecode.email },
            "_id"
          );
          if (userId) {
            //give a new token
            const token = jwt.sign(
              { email: userId[0].email },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: "10m" }
            );
            req.body.userId = userId;
            req.body.token = token;
            console.log("using refresh token");
            const cart = await Cart.find({ userId: userId[0]._id });
            if (cart) {
              console.log(cart[0]);
              req.body.cartInfos = cart[0];
              next();
            } else {
              console.log("no cart found");
            }
          } else {
            console.log("no user found");
          }
        } catch (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "signin again",
              error: err,
            });
          }
        }
      }
    }
  }
  next();
};
