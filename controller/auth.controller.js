const User = require("../model/users");
const Cart = require("../model/carts");
const SocketId = require("../model/socketid");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Socketid = require("../model/socketid");

require("dotenv").config();

module.exports.verifyManagerToken = async (token) => {
  let isTokenExpire = false;
  let isRefreshTokenExpire = false;
  let accessTokenDecode;
  let refreshTokenDecode;

  try {
    accessTokenDecode = jwt.verify(
      token.tostring(),
      process.env.ACCESS_TOKEN_SECRET
    );
  } catch {
    isTokenExpire = true;
  }

  accessTokenDecode = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);

  if (!isTokenExpire) {
    if (
      accessTokenDecode.role != "Manager" &&
      accessTokenDecode.role != "Admin"
    ) {
      return {
        success: false,
        message: "you're not admin or manager",
        number: "1",
      };
    }

    const userId = await User.find(
      { email: accessTokenDecode.email },
      "_id role"
    );
    if (!userId) {
      return {
        success: false,
        message: "can't find user",
        number: "2",
      };
    }
    if (userId[0].role == "Manager" || userId[0].role == "Admin") {
      return { success: true, message: "welcome back", number: "ok" };
    }
    return { success: false, message: "some error", number: "3" };
  }

  const user = await User.find(
    { email: accessTokenDecode?.email },
    "email refreshToken role"
  );
  if (!user) {
    return { success: false, message: "can't find user", number: "4" };
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
    return {
      sucess: false,
      message: "token and refreshtoken are expire",
      number: "5",
    };
  }
  if (
    refreshTokenDecode?.role !== "Manager" &&
    refreshTokenDecode?.role !== "Admin"
  ) {
    return {
      success: false,
      message: "you're not admin or manager",
      number: "6",
    };
  }
  const userId = await User.find(
    { email: refreshTokenDecode.email },
    "_id role"
  );
  if (!userId) {
    return {
      success: false,
      message: "can't find user",
      number: "7",
    };
  }
  return {
    success: true,
    message: "welcome",
  };
};

module.exports.decodeUserToken = async (token) => {
  accessTokenDecode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  return accessTokenDecode;
};

async function checkTokenExpiration(token, key) {
  let tokenDecode;
  //verify token
  try {
    tokenDecode = jwt.verify(token.toString(), key);
    //decode tokena
    tokenDecode = jwt.decode(token.toString(), key);
  } catch {
    return { isExpire: true };
  }
  //if token is not expire
  return { isExpire: false, email: tokenDecode };
}

module.exports.verifyUser = async (req, res, next) => {
  let access_token = "";
  const { email, refresh_token } = req.body;

  if (email === "") {
    return res.status(500).json({
      success: false,
      message: "no email",
    });
  }
  //retrive token from header authorization bearer
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
  //check if access_token is expire
  const access_token_expiration = await checkTokenExpiration(
    access_token,
    (key = process.env.ACCESS_TOKEN_SECRET)
  );
  if (!access_token_expiration.isExpire) {
    //set new token to req body
    req.body.token = access_token;
    return next();
    // return res.status(200).json({
    //   success: true,
    //   access_token_expiration,
    //   message: "access token not expire",
    // });
  }

  console.log("token is expire, check refresh_token");
  //check if refresh_token is expire
  const deliver = await User.find({ email });
  console.log(email);
  console.log(deliver);

  if (deliver.length > 1) {
    return res.status(500).json({
      success: false,
      message: "no user found",
    });
  }

  for (let index = 0; index < deliver[0].refreshToken.length; index++) {
    const refresh_token_expiration = await checkTokenExpiration(
      deliver[0].refreshToken[index],
      (key = process.env.REFRESH_TOKEN_SECRET)
    );

    if (!refresh_token_expiration.isExpire) {
      //sign a new token
      const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1m",
      });
      req.body.token = token;
      return next();
      // return res.status(200).json({
      //   success: true,
      //   refresh_token_expiration,
      //   message: "refresh token not expire",
      // });
    }
  }

  return res.status(500).json({
    success: false,
    message: "signin again",
    reason: "refresh token and access token are expire, require login again",
  });
};

module.exports.oldverifyUser = async (req, res, next) => {
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
