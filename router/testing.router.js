var express = require("express");
var router = express.Router();

var authController = require("../controller/auth.controller");
var orderController = require("../controller/order.controller");
var statisticController = require("../controller/statistic.controller");

router.post("/checkOrder", orderController.checkOrder);
router.get("/lastElement", authController.testRetriveLastInArray);

router.get("/incomeHistory", orderController.testIncomeHistory);
router.get("/incomeByStatus", statisticController.incomeByStatus);
router.post("/testingStats", statisticController.testingStats);

router.use(authController.verifyUser);
router.post("/allOrder", orderController.getAllOrderById);
// router.post('/sendmail')

module.exports = router;
