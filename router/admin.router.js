var express = require("express");
var router = express.Router();

var adminController = require("../controller/admin.controller");

router.delete("/deleteAllUser", adminController.deleteAllUser);
router.delete("/deleteUser", adminController.deleteUser);

module.exports = router;
