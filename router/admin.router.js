var express = require("express");
var router = express.Router();

var adminController = require("../controller/admin.controller");
var authController = require("../controller/auth.controller");
var orderController = require("../controller/order.controller");
var productController = require("../controller/products.controller");
var statisticController = require("../controller/statistic.controller");
var {
  upload,
  uploadCloudinary,
  deleteSingleFileCloudinary,
  uploadColor,
} = require("../controller/upload.controller");

router.delete("/deleteAllUser", adminController.deleteAllUser);
router.delete("/deleteUser", adminController.deleteUser);
router.post("/login", adminController.login);

//verify manager or admin middleware
router.use(authController.verifyManagerAdmin);

//cloudinary
router.post(
  "/createProduct",
  upload.array("myFiles", 4),
  uploadCloudinary,
  productController.createProduct
);
router.post(
  "/createColor",
  upload.array("myFiles", 4),
  uploadColor,
  productController.createColor
);
router.post("/testDeleteByUrl", deleteSingleFileCloudinary);

//users
router.post("/verify", adminController.passVerify);
router.post("/allUser", adminController.showAllUser);
router.post("/editUser/:id", adminController.editUser);
router.delete("/delete/:id", adminController.deleteUser);

//orders
router.post("/getAllOrder", orderController.getAllOrderAdmin);
router.post("/getDeliveringOrder", orderController.getAllDeliveryOrderAdmin);
router.post(
  "/approveOrder",
  orderController.approveOrder,
  orderController.getAllOrderAdmin
);
router.post(
  "/finishOrder",
  orderController.finishOrder,
  orderController.getAllDeliveryOrderAdmin
);

//products
router.post("/getAllProducts", adminController.showAllProduct);
router.post("/updateProductName", productController.updateProductName);
router.post("/updateProductBrand", productController.updateProductBrand);
router.post("/updateProductCategory", productController.updateProductCategory);
router.post("/updateProductSize", productController.updateProductSize);
router.post("/updateProductColor", productController.updateProductColor);
router.post("/addProductSize", productController.addProductSize);

router.delete("/deleteProductSize", productController.deleteProductSize);
router.delete("/deleteProductColor", productController.deleteProductColor);

//statistic
router.get("/getStatisticByMonth", statisticController.statisticIncomeByMonth);
router.get("/getGeneral", statisticController.generalStatistic);
router.get("/incomeByStatus", statisticController.incomeByStatus);
router.get("/statsYears", statisticController.statisticYears);
router.get("/statsMonths/:year", statisticController.statisticMonths);
router.get("/statsByMonth/:year", statisticController.statisticIncomeByYears);
router.get(
  "/statsByMonthAndYear/:year/:month",
  statisticController.statisticIncomeByYearAndMonth
);
router.post(
  "/statsBetweenTwoDates",
  statisticController.statisticIncomeBetweenTwoDates
);

//test space
router.post("/test", authController.testing);

module.exports = router;
