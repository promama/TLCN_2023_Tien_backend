const User = require("../model/users");
const Cart = require("../model/carts");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

function verifyToken(token) {}

module.exports.verifyUser = async (req, res, next) => {
  let isTokenExpire = false;
  let refreshTokenDecode = true;
  let accessTokenDecode;
  let isRefreshTokenExpire;
  let access_token = "";
  console.log("verifying");
  console.log(req.headers.authorization.split(" ")[1]);
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
  console.log(access_token);

  try {
    accessTokenDecode = jwt.verify(
      access_token.toString(),
      process.env.ACCESS_TOKEN_SECRET
    );
  } catch {
    isTokenExpire = true;
  }

  accessTokenDecode = jwt.decode(
    access_token.toString(),
    process.env.ACCESS_TOKEN_SECRET
  );
  console.log(isTokenExpire);
  console.log(accessTokenDecode);

  //check condition if token is not expired
  if (!isTokenExpire) {
    const userId = await User.find(
      { email: accessTokenDecode.email },
      "_id role"
    );
    if (!userId) {
      return res.status(500).json({
        success: false,
        message: "signin again",
        number: "2",
      });
    }
    req.body.userId = userId;
    req.body.token = access_token;

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
  }

  //condition when token is expired
  //checking refreshtoken
  const user = await User.find(
    { email: accessTokenDecode?.email },
    "email refreshToken role"
  );
  if (!user) {
    return res.status(500).json({
      success: false,
      message: "signin again",
      number: "3",
    });
  }

  user[0]?.refreshToken.map((token) => {
    try {
      isRefreshTokenExpire = false;
      refreshTokenDecode = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      isRefreshTokenExpire = true;
    }
  });

  //both token and refreshtoken are expired
  //force signin again
  if (isRefreshTokenExpire) {
    return res.status(500).json({
      success: false,
      message: "signin again",
      number: "4",
    });
  }

  try {
    const userId = await User.find(
      { email: accessTokenDecode?.email },
      "_id role"
    );
    if (!userId) {
      return res.status(500).json({
        success: false,
        message: "signin again",
        number: "6",
      });
    }
    req.body.userId = userId;

    const cart = await Cart.find({ userId: userId[0]?._id });
    if (!cart) {
      return res.status(500).json({
        success: false,
        message: "no cart found",
      });
    }
    console.log(cart[0]);
    req.body.cartInfos = cart[0];
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "signin again",
      number: "8",
    });
  }

  //give a new token
  const token = jwt.sign(
    { email: refreshTokenDecode.email, role: refreshTokenDecode.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "5m" }
  );

  req.body.token = token;
  console.log("using refresh token");
  return next();
};

module.exports.verifyManagerAdmin = async (req, res, next) => {
  let isTokenExpire = false;
  let isRefreshTokenExpire = false;
  let accessTokenDecode;
  let refreshTokenDecode;
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
    accessTokenDecode = jwt.verify(
      access_token.toString(),
      process.env.ACCESS_TOKEN_SECRET
    );
  } catch {
    isTokenExpire = true;
  }

  accessTokenDecode = jwt.decode(
    access_token.toString(),
    process.env.ACCESS_TOKEN_SECRET
  );
  console.log(accessTokenDecode);

  //check condition if token is not expired
  if (!isTokenExpire) {
    if (
      accessTokenDecode.role !== "Manager" &&
      accessTokenDecode.role !== "Admin"
    ) {
      return res.status(500).json({
        success: false,
        message: "signin again",
        number: "1",
      });
    }

    const userId = await User.find(
      { email: accessTokenDecode.email },
      "_id role"
    );
    if (!userId) {
      return res.status(500).json({
        success: false,
        message: "signin again",
        number: "2",
      });
    }

    if (userId[0].role == "Manager" || userId[0].role == "Admin") {
      req.body.userId = userId;
      req.body.token = access_token;
      console.log("using token");
      return next();
    }
    return res.status(500).json({
      success: false,
      message: "signin again",
      number: "3",
    });
  }

  //condition when token is expired
  //checking refreshtoken
  const user = await User.find(
    { email: accessTokenDecode?.email },
    "email refreshToken role"
  );
  if (!user) {
    return res.status(500).json({
      success: false,
      message: "signin again",
      number: "3",
    });
  }

  user[0]?.refreshToken.map((token) => {
    try {
      isRefreshTokenExpire = false;
      refreshTokenDecode = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      isRefreshTokenExpire = true;
    }
  });

  if (isRefreshTokenExpire) {
    return res.status(500).json({
      success: false,
      message: "signin again",
      number: "4",
    });
  }

  if (
    refreshTokenDecode?.role !== "Manager" &&
    refreshTokenDecode?.role !== "Admin"
  ) {
    return res.status(500).json({
      success: false,
      message: "signin again",
      number: "5",
    });
  }

  const userId = await User.find(
    { email: refreshTokenDecode.email },
    "_id role"
  );
  if (!userId) {
    return res.status(500).json({
      success: false,
      message: "signin again",
      number: "6",
    });
  }

  if (userId[0].role !== "Manager" && userId[0].role !== "Admin") {
    return res.status(500).json({
      success: false,
      message: "signin again",
      number: "7",
    });
  }

  //give a new token
  const token = jwt.sign(
    { email: refreshTokenDecode.email, role: refreshTokenDecode.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10s" }
  );
  req.body.userId = userId;
  req.body.token = token;
  console.log("using refresh token");
  return next();
};

//testing space
module.exports.testing = async (req, res) => {
  let isTokenExpire = false;
  let isRefreshTokenExpire = false;
  let accessTokenDecode;
  let refreshTokenDecode;
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
    accessTokenDecode = jwt.verify(
      access_token.toString(),
      process.env.ACCESS_TOKEN_SECRET
    );
  } catch {
    isTokenExpire = true;
  }

  //check condition if token is not expired
  if (!isTokenExpire) {
    if (
      accessTokenDecode.role !== "manager" &&
      accessTokenDecode.role !== "admin"
    ) {
      return res.status(500).json({
        success: false,
        message: "signin again",
      });
    }

    const userId = await User.find(
      { email: accessTokenDecode.email },
      "_id role"
    );
    if (!userId) {
      return res.status(500).json({
        success: false,
        message: "signin again",
      });
    }

    if (userId[0].role == "manager" || userId[0].role == "admin") {
      req.body.userId = userId;
      console.log("using token");
      return next();
    }
    return res.status(500).json({
      success: false,
      message: "signin again",
    });
  }

  //condition when token is expired
  //checking refreshtoken
  try {
    refreshTokenDecode = jwt.verify(
      req.body.refresh_token,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch {
    isRefreshTokenExpire = true;
  }

  if (isRefreshTokenExpire) {
    return res.status(500).json({
      success: false,
      message: "signin again",
    });
  }

  if (
    refreshTokenDecode.role !== "manager" &&
    refreshTokenDecode.role !== "admin"
  ) {
    return res.status(500).json({
      success: false,
      message: "signin again",
    });
  }

  const userId = await User.find(
    { email: refreshTokenDecode.email },
    "_id role"
  );
  if (!userId) {
    return res.status(500).json({
      success: false,
      message: "signin again",
    });
  }

  if (userId[0].role !== "manager" && userId[0].role !== "admin") {
    return res.status(500).json({
      success: false,
      message: "signin again",
    });
  }

  //give a new token
  const token = jwt.sign(
    { email: userId[0].email, role: userId[0].role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "10m" }
  );
  req.body.userId = userId;
  req.body.token = token;
  console.log("using refresh token");
  return next();
};

module.exports.testRetriveLastInArray = async (req, res) => {
  const user = await User.find({ _id: "6614a03673658459627cc0f0" });

  user[0].refreshToken.map((token) => {
    console.log(token);
  });

  return res.json({
    data: user,
  });
};
