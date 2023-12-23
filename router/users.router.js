var express = require("express");
var router = express.Router();
var userController = require("../controller/users.controller");
var authController = require("../controller/auth.controller");
var adminController = require("../controller/admin.controller");

router.get("/", userController.test);
router.post("/createUser", userController.createAccount);
router.post("/login", userController.loginAccount);

//verify sign in middleware
router.use(authController.verifyUser);

//
router.post("/getAllAddress", userController.getAllAddress);
router.get("/showUserShortProfile", userController.showUserShortProfile);
router.post("/verify", adminController.passVerify);
router.post("/createNewAddress", userController.createNewAddress);
router.post("/editUserProfile", userController.editUserProfile);
router.post("/setUserDefaultAddress/:id", userController.setUserDefaultAddress);
router.delete(
  "/deleteUserAddressById/:id",
  userController.deleteUserAddressById
);

module.exports = router;
