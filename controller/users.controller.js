const User = require("../model/users");
const Cart = require("../model/carts");
const mongoose = require("mongoose");
const ProductInCart = require("../model/productincart");
const Address = require("../model/address");
const Order = require("../model/order");
const Product = require("../model/products");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const nodemailer = require("nodemailer");
const Notification = require("../model/notification");

var ObjectID = require("mongodb").ObjectId;

dayjs.extend(customParseFormat);
require("dotenv").config();

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

module.exports.test = async (req, res) => {
  var users = await User.find();
  if (users.length == 0) {
    return res.json({
      message: "no user found",
    });
  } else {
    return res.json({
      users,
    });
  }
};

module.exports.loginAccount = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  console.log(req.body);
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
          { expiresIn: "1h" }
        );
        //create access token with time limit: 5mins
        const token = jwt.sign(
          { email: user[0].email, role: user[0].role },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "5m" }
        );
        //find user and update refresh token
        const userFound = await User.findOneAndUpdate(
          { email },
          { $push: { refreshToken } }
        );

        const u = await User.find({ email });

        const cart = await Cart.find({ userId: user[0]._id });

        const order = await Order.find({
          userId: user[0]._id,
          status: "In cart",
        });

        const products = await ProductInCart.find(
          { userId: user[0]._id, status: "In cart" },
          "productId color size url productName quantity price orderId"
        );

        const notify = await Notification.find({ email });

        return res.status(201).json({
          success: true,
          message: "login success",
          email,
          birthDay: u[0].birthDay,
          gender: u[0].sex,
          phoneNumber: u[0].phoneNumber,
          token,
          orderId: order[0]?._id,
          cart: cart[0],
          products,
          notify,
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

module.exports.notification = async (req, res) => {
  const notify = await Notification.find({ email: req.body.email });
  let unreadNoti;

  for (let index = 0; index < notify.length; index++) {
    if (notify[index].isRead != true) {
      unreadNoti++;
    }
  }

  return res.json({
    listNotification: notify,
    unreadNoti,
  });
};

module.exports.createAccount = (req, res) => {
  if (
    req.body.email == "" ||
    req.body.password == "" ||
    req.body.repassword == ""
  ) {
    return res.status(400).json({
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
            return res.status(409).json({
              success: false,
              message: "email existed",
            });
          } else {
            //hash password
            bcrypt.hash(req.body.password, 10, (err, hashed) => {
              if (err) {
                return res.status(500).json({
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

                //create address with userId
                const address = new Address({
                  _id: new mongoose.Types.ObjectId(),
                  userId: user._id,
                  isDefault: true,
                });

                //create order with userId
                const order = new Order({
                  _id: new mongoose.Types.ObjectId(),
                  userId: user._id,
                  cartId: cart._id,
                  status: "In cart",
                });

                order.save().then((result) => {
                  console.log(result);
                });

                address.save().then((result) => {
                  console.log(result);
                });

                cart.save().then((result) => {
                  console.log(result);
                });

                user
                  .save()
                  .then((result) => {
                    console.log(result);
                    return res.status(201).json({
                      success: true,
                      data: {
                        email: user.email,
                      },
                      message: "create user success!",
                    });
                  })
                  .catch((err) => {
                    return res.status(500).json({
                      success: false,
                      message: "email format is not correct",
                    });
                  });
              }
            });
          }
        });
    } else {
      return res.status(400).json({
        success: false,
        message: "password and repassword not match!",
      });
    }
  }
};

function checkPhoneNumberFormat(phoneNumber) {
  var regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  try {
    if (phoneNumber.match(regex)) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports.createNewAddress = async (req, res) => {
  console.log(req.body);

  const { name, phoneNumber, address, userId, addressId } = req.body;

  if (addressId != null) {
    await Address.findByIdAndUpdate(
      { _id: addressId },
      {
        $set: {
          name,
          phoneNumber,
          address,
        },
      }
    );

    const allAddress = await Address.find(
      { userId: userId[0]._id },
      "_id userId isDefault address name phoneNumber"
    ).sort({ isDefault: -1 });

    return res.status(200).json({
      success: true,
      message: "edit success",
      address: allAddress,
      token: req.body.token,
    });
  }

  if (!checkPhoneNumberFormat(phoneNumber)) {
    return res.status(500).json({
      success: false,
      message: "phone number must have 10 digits",
    });
  }

  try {
    const addresses = await Address.find({ userId: userId[0]._id });
    console.log(addresses);

    for (let i = 0; i < addresses.length; i++) {
      if (
        (addresses[i].isDefault == true && addresses[i].address == null) ||
        addresses[i].name == null ||
        addresses[i].phoneNumber == null
      ) {
        //create main address and return
        await Address.findByIdAndUpdate(
          { _id: addresses[i]._id },
          {
            $set: { address, phoneNumber, name },
          },
          {
            new: true,
          }
        ).exec();

        const allAddress = await Address.find(
          { userId: userId[0]._id },
          "_id userId isDefault address name phoneNumber"
        ).sort({ isDefault: -1 });

        return res.status(200).json({
          success: true,
          message: "create new main",
          address: allAddress,
          token: req.body.token,
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
  console.log("242");

  try {
    //create sub address and return
    const subAddress = new Address({
      _id: new mongoose.Types.ObjectId(),
      userId: userId[0]._id,
      phoneNumber,
      name,
      address,
      isDefault: false,
    });

    await subAddress.save().then((result) => {
      console.log(result);
    });

    const allAddress = await Address.find(
      { userId: userId[0]._id },
      "_id userId isDefault address name phoneNumber"
    ).sort({ isDefault: -1 });

    return res.status(200).json({
      success: true,
      message: "create new sub",
      address: allAddress,
      token: req.body.token,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
};

module.exports.getAllAddress = async (req, res) => {
  console.log(req.body);
  console.log("here");

  try {
    const { userId } = req.body;
    const allAddress = await Address.find(
      { userId: userId[0]._id },
      "_id userId isDefault address name phoneNumber"
    ).sort({ isDefault: -1 });
    console.log(allAddress);
    return res.status(200).json({
      success: true,
      message: "get all address",
      address: allAddress,
      token: req.body.token,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
};

module.exports.editUserProfile = async (req, res) => {
  console.log(req.body);

  const { phone, gender, dob, userId } = req.body;

  if (!checkPhoneNumberFormat(phone)) {
    return res.status(500).json({
      success: false,
      message: "phone number must have 10 digits",
    });
  }

  if (gender !== "Male" && gender !== "Female") {
    return res.status(500).json({
      success: false,
      message: "gender wrong",
    });
  }

  const user = await User.find({ _id: userId[0]._id });
  if (user.length < 1) {
    return res.status(500).json({
      success: false,
      message: "sign in again",
    });
  }

  await User.findByIdAndUpdate(
    { _id: userId[0]._id },
    {
      $set: {
        phoneNumber: phone,
        sex: gender,
        birthDay: dob,
      },
    }
  ).exec();

  const userInfos = await User.find(
    { _id: userId[0]._id },
    "email phoneNumber sex birthDay"
  );

  // if (!dayjs(dob, "DD/MM/YYYY", true).isValid()) {
  //   return res.status(500).json({
  //     success: false,
  //     message: "date of birth wrong",
  //   });
  // }

  return res.status(200).json({
    data: userInfos[0],
    message: "update infos success",
    token: req.body.token,
  });
};

module.exports.showUserShortProfile = async (req, res) => {
  console.log(req.body);
  const userShortProfile = await User.find(
    { _id: req.body.userId[0]._id },
    "birthDay phoneNumber sex"
  );

  if (userShortProfile.length < 1) {
    return res.status(500).json({
      success: false,
      message: "no user found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "good",
    data: userShortProfile[0],
    token: req.body.token,
  });
};

module.exports.deleteUserAddressById = async (req, res) => {
  console.log(req.params.id);

  if (!ObjectID.isValid(req.params.id)) {
    return res.status(500).json({
      success: false,
      message: "Address id invalid",
    });
  }
  try {
    await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.body.userId[0]._id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }

  try {
    const addresses = await Address.find(
      { userId: req.body.userId[0]._id },
      "_id userId isDefault address name phoneNumber"
    ).sort({ isDefault: -1 });

    if (addresses.length < 1) {
      return res.status(500).json({
        success: false,
        message: "smth wrong deleteUserAddressById",
      });
    }

    return res.status(200).json({
      success: true,
      message: "delete success",
      address: addresses,
      token: req.body.token,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }
};

module.exports.setUserDefaultAddress = async (req, res) => {
  console.log(req.params.id);

  const address = await Address.find({
    _id: req.params.id,
    userId: req.body.userId[0]._id,
  });

  if (address.length < 1) {
    return res.status(500).json({
      success: false,
      message: "no address found",
    });
  }

  await Address.findOneAndUpdate(
    { userId: req.body.userId[0]._id, isDefault: true },
    {
      $set: {
        isDefault: false,
      },
    }
  );

  await Address.findOneAndUpdate(
    { userId: req.body.userId[0]._id, _id: req.params.id },
    {
      $set: {
        isDefault: true,
      },
    }
  );

  const addresses = await Address.find(
    { userId: req.body.userId[0]._id },
    "_id userId isDefault address name phoneNumber"
  ).sort({ isDefault: -1 });

  return res.status(200).json({
    success: true,
    message: "set default success",
    address: addresses,
    token: req.body.token,
  });
};

module.exports.rateProduct = async (req, res, next) => {
  console.log(req.body);

  if (req.body.raing < 1 || req.body.rating > 5) {
    return res.status(500).json({
      success: false,
      message: "rating must be between 1-5",
    });
  }

  try {
    await ProductInCart.findOneAndUpdate(
      { _id: req.body._id },
      { $set: { allowRating: false, rating: req.body.rating } }
    );

    await Product.findOneAndUpdate(
      { _id: req.body.productId },
      { $inc: { numberOfRate: 1, totalPoint: req.body.rating } }
    );
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "error rating",
    });
  }
  next();
};

module.exports.changePassword = async (req, res) => {
  const { password, newPassword, reNewPassword } = req.body;

  if (
    password.trim() == "" ||
    newPassword.trim() == "" ||
    reNewPassword.trim() == ""
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill all field",
    });
  }

  if (password == newPassword) {
    return res.status(400).json({
      success: false,
      message: "Cannot set old password as new password",
    });
  }

  const comparePassword = await User.find({
    _id: req.body.userId[0]._id,
  }).exec();

  if (comparePassword.length < 1) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }

  const matched = await compareHashedPassword(
    password,
    comparePassword[0].password
  );
  if (!matched) {
    return res.status(400).json({
      success: false,
      message: "Current password not match",
    });
  }

  if (newPassword !== reNewPassword) {
    return res.status(400).json({
      success: false,
      message: "password and repassword not match!",
    });
  }

  try {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await User.findOneAndUpdate(
      { _id: req.body.userId[0]._id },
      { $set: { password: hashedPassword } }
    );
    return res.status(201).json({
      success: true,
      message: "Change password success!",
      token: req.body.token,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "smth wrong",
    });
  }
};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "maddison53@ethereal.email",
    pass: "jn7jnAPss4f63QBp6D",
  },
});

module.exports.sendMail = async (req, res) => {};
