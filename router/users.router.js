var express = require("express");
var router = express.Router();

var userController = require("../controller/users.controller");

router.get("/", userController.test);

module.exports = router;
