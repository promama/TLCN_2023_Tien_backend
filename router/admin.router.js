var express = require("express");
var router = express.Router();

var adminController = require("../controller/admin.controller");
var authController = require("../controller/auth.controller");
var orderController = require("../controller/order.controller");
var productController = require("../controller/products.controller");
var {
  upload,
  uploadCloudinary,
  deleteSingleFileCloudinary,
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
router.post("/testDeleteByUrl", deleteSingleFileCloudinary);

//users
router.post("/verify", adminController.passVerify);
router.post("/allUser", adminController.showAllUser);
router.post("/editUser/:id", adminController.editUser);
router.delete("/delete/:id", adminController.deleteUser);

//orders
router.post("/getAllOrder", orderController.getAllOrderAdmin);

//products
router.post("/getAllProducts", adminController.showAllProduct);

//test space
router.post("/test", authController.testing);

module.exports = router;
