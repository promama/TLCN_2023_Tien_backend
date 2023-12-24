const User = require("../model/users");
const Cart = require("../model/carts");
const Address = require("../model/address");
const ProductInCart = require("../model/productincart");
const Product = require("../model/products");
const Color = require("../model/color");
const Size = require("../model/size");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  checkPhoneNumberFormat,
  checkGender,
  checkRole,
  checkUserExisted,
} = require("../utilities/userContext");

var ObjectID = require("mongodb").ObjectId;

require("dotenv").config();

module.exports.deleteAllUser = async (req, res) => {};

// module.exports.deleteUser = async (req, res) => {
//   const email = req.body.email;
//   const result = await User.find({ email: email }).exec();
//   const cart = await Cart.findOneAndDelete({ userId: result[0]._id }).exec();
//   User.findOneAndDelete({ email: email }).exec();
// };

function checkTypedEmailPassword(email, password) {
  if (email == null || password == null || email == "" || password == "") {
    return false;
  } else {
    return true;
  }
}

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

module.exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const haveEmailPassword = checkTypedEmailPassword(email, password);
  var matchedPassword = false;

  if (haveEmailPassword) {
    const user = await User.find({ email }).exec();
    if (user.length > 0) {
      if (user[0].role === "user") {
        return res.status(400).json({
          success: false,
          message: "Not a admin account",
        });
      }
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
          { expiresIn: "1h" }
        );
        //create access token with time limit: 5mins
        const token = jwt.sign(
          { email: user[0].email, role: user[0].role },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "10m" }
        );
        //find user and update refresh token
        await User.findOneAndUpdate({ email }, { refreshToken });

        return res.status(201).json({
          success: true,
          message: "login success",
          email,
          token,
          refreshToken,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "wrong password",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "no user found",
      });
    }
  } else {
    console.log("email: " + email + "/npassword: " + password);
    return res.status(400).json({
      success: false,
      message: "please enter your email and password",
    });
  }
};

module.exports.showAllUser = async (req, res) => {
  console.log("request from body");
  console.log(req.body);
  try {
    const listUsers = await User.find({ role: { $not: /^A.*/ } });
    console.log(listUsers);
    return res.status(200).json({
      success: true,
      message: "get all user successfully!",
      users: listUsers,
      token: req.body.token,
    });
  } catch (err) {
    console.log(err);
  }
  return res.status(500).json({
    success: false,
    message: "signin again",
  });
};

module.exports.passVerify = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "authorized",
    token: req.body.token,
  });
};

module.exports.editUser = async (req, res) => {
  console.log("request from body");
  console.log(req.body);
  const { props } = req.body;
  let updateProps = {};
  // check phone format
  if (props.phone != null) {
    const verifyPhone = checkPhoneNumberFormat(props.phone);
    if (!verifyPhone) {
      return res.status(500).json({
        success: false,
        message: "phone format problem",
      });
    }
  }

  //verify gender
  if (props.gender != null) {
    const verifyGender = checkGender(props.gender);
    if (!verifyGender) {
      return res.status(500).json({
        success: false,
        message: "gender format problem",
      });
    }
  }

  //verify role
  const verifyRole = checkRole(props.role);
  if (!verifyRole) {
    return res.status(500).json({
      success: false,
      message: "role format problem",
    });
  }

  updateProps = Object.assign(
    {},
    {
      phoneNumber: props.phone,
      sex: props.gender,
      status: props.status,
      role: props.role,
      birthDay: props.dob,
    }
  );

  console.log("my object:    ");
  console.log(updateProps);

  const isExisted = await checkUserExisted(props._id);
  if (!isExisted) {
    return res.status(500).json({
      success: false,
      message: "can't find user",
    });
  }

  try {
    await User.findByIdAndUpdate({ _id: props._id }, updateProps);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "can't edit user",
    });
  }

  try {
    const listUsers = await User.find({ role: { $not: /^A.*/ } });
    return res.status(200).json({
      success: true,
      message: "update success!",
      users: listUsers,
      token: req.body.token,
    });
  } catch (err) {
    console.log(err);
  }
  return res.status(500).json({
    success: false,
    message: "signin again",
  });
};

module.exports.deleteUser = async (req, res) => {
  console.log("request from body");
  console.log(req.body);
  console.log(req.params.id);

  const filter = { userId: req.params.id };

  //delete address
  try {
    await Address.deleteMany(filter);
  } catch (err) {
    console.log("error on delete address");
  }
  //delete productincart
  try {
    await ProductInCart.deleteMany(filter);
  } catch (err) {
    console.log("error on delete product in cart");
  }
  //delete cart
  try {
    await Cart.findOneAndDelete(filter);
  } catch (err) {
    console.log("error on delete address");
  }
  //delete user
  try {
    await User.findOneAndDelete({ _id: req.params.id });
  } catch (err) {
    console.log("error on delete address");
  }

  try {
    const listUsers = await User.find({ role: { $not: /^A.*/ } });
    console.log(listUsers);
    return res.status(200).json({
      success: true,
      message: `delete user: ${req.params.id} successfully!`,
      users: listUsers,
      token: req.body.token,
    });
  } catch (err) {
    console.log(err);
  }
  return res.status(500).json({
    success: false,
    message: "signin again",
  });
};

module.exports.showAllProduct = async (req, res) => {
  let resData = [];
  let tempProduct = [];
  let tempColor = [];
  let tempSize = [];

  let products = await Product.find();
  products.map((product) => {
    tempProduct.push(product);
  });

  let colors = await Color.find();
  colors.map((color) => {
    tempColor.push(color);
  });

  let sizes = await Size.find();
  sizes.map((size) => {
    tempSize.push(size);
  });

  return res.status(200).json({
    success: true,
    message: "ok",
    products: tempProduct,
    colors: tempColor,
    sizes: tempSize,
  });
};
