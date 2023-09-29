var express = require("express");
var router = express.Router();
var userController = require("../controller/users.controller");
var authController = require("../controller/auth.controller");

router.get("/", userController.test);
router.post("/createUser", userController.createAccount);
router.post("/login", userController.loginAccount);

module.exports = router;
