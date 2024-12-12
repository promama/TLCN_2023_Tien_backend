var express = require("express");
var router = express.Router();
var userController = require("../controller/users.controller");
var authController = require("../controller/auth.controller");
var adminController = require("../controller/admin.controller");
var orderController = require("../controller/order.controller");

router.get("/", userController.test);
router.post("/createUser", userController.createAccount);
router.post("/login", userController.loginAccount);

//verify sign in middleware
router.use(authController.verifyUser);

//user
router.post("/getAllAddress", userController.getAllAddress);
router.post("/showUserShortProfile", userController.showUserShortProfile);
router.post("/verify", adminController.passVerify);
router.post("/createNewAddress", userController.createNewAddress);
router.post("/editUserProfile", userController.editUserProfile);
router.post("/setUserDefaultAddress/:id", userController.setUserDefaultAddress);
router.delete(
  "/deleteUserAddressById/:id",
  userController.deleteUserAddressById
);
router.post("/finishOrder", orderController.finishOrder);
router.post("/cancelOrder", orderController.cancelOrder);
router.post("/changePassword", userController.changePassword);

//product
router.post("/confirmOder", orderController.postUserConfirmOrder);
router.post(
  "/rateProduct",
  userController.rateProduct,
  orderController.getAllOrderById
);
router.post("/notification", userController.notification);
router.post(
  "/readNotify",
  userController.markAsReadNotification,
  userController.notification
);

module.exports = router;
