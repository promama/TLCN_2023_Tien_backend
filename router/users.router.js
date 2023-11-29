var express = require("express");
var router = express.Router();
var userController = require("../controller/users.controller");
var authController = require("../controller/auth.controller");

router.get("/", userController.test);
router.post("/createUser", userController.createAccount);
router.post("/login", userController.loginAccount);
router.post(
  "/createNewAddress",
  authController.verifyUser,
  userController.createNewAddress
);
router.get(
  "/getAllAddress",
  authController.verifyUser,
  userController.getAllAddress
);

router.post(
  "/editUserProfile",
  authController.verifyUser,
  userController.editUserProfile
);

router.get(
  "/showUserShortProfile",
  authController.verifyUser,
  userController.showUserShortProfile
);

router.delete(
  "/deleteUserAddressById/:id",
  authController.verifyUser,
  userController.deleteUserAddressById
);

router.post(
  "/setUserDefaultAddress/:id",
  authController.verifyUser,
  userController.setUserDefaultAddress
);

module.exports = router;
