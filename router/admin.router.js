var express = require("express");
var router = express.Router();

var adminController = require("../controller/admin.controller");
var authController = require("../controller/auth.controller");
var orderController = require("../controller/order.controller");

router.delete("/deleteAllUser", adminController.deleteAllUser);
router.delete("/deleteUser", adminController.deleteUser);
router.post("/login", adminController.login);

//verify manager or admin middleware
router.use(authController.verifyManagerAdmin);

router.post("/verify", adminController.passVerify);
router.post("/allUser", adminController.showAllUser);
router.post("/editUser/:id", adminController.editUser);
router.delete("/delete/:id", adminController.deleteUser);

//orders
router.post("/getAllOrder", orderController.getAllOrderAdmin);

//test space
router.post("/test", authController.testing);

module.exports = router;
