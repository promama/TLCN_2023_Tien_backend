var express = require("express");
var router = express.Router();

var authController = require("../controller/auth.controller");
var orderController = require("../controller/order.controller");

router.post("/checkOrder", orderController.checkOrder);
router.get("/lastElement", authController.testRetriveLastInArray);

router.use(authController.verifyUser);
router.post("/allOrder", orderController.getAllOrderById);

module.exports = router;
