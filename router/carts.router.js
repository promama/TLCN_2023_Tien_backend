var express = require("express");
var router = express.Router();

var cartController = require("../controller/cart.controller");
var authController = require("../controller/auth.controller");
var orderController = require("../controller/order.controller");

//verify sign in middleware
router.use(authController.verifyUser);

//add product to cart
router.post("/addToCart", cartController.addToCart);
//subtract product to cart
router.post("/subtractToCart", cartController.subtractToCart);
//get all cart items
router.post("/getCartItems", cartController.showCartItems);
//show all order of user
router.post("/allOrder", orderController.getAllOrderById);
//show "waiting approve" status order
router.post("/waitingApproveOrder", orderController.getWaitingApproveOrder);
//show "Delivering" status order
router.post("/deliveringOrder", orderController.getDeliveringOrder);
//show "Finish" status order
router.post("/finishOrder", orderController.getFinishOrder);

//test quantity
router.post("/testQuantity", cartController.testAddToCart);
router.post("/testAddOneAndUpdate", cartController.testAddOneAndUpdate);

module.exports = router;
