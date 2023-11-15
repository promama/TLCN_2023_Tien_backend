var express = require("express");
var router = express.Router();

var cartController = require("../controller/cart.controller");
var authController = require("../controller/auth.controller");

//add product to cart
router.post("/addToCart", authController.verifyUser, cartController.addToCart);

//subtract product to cart
router.post(
  "/subtractToCart",
  authController.verifyUser,
  cartController.subtractToCart
);

//test quantity
router.post("/testQuantity", cartController.testAddToCart);
router.post("/testAddOneAndUpdate", cartController.testAddOneAndUpdate);

module.exports = router;
