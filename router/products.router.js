var express = require("express");
var router = express.Router();

var productController = require("../controller/products.controller");

//test find size in color
router.get("/getSize", productController.findSize);

//test find size in color and update
router.post("/updateSize", productController.findSizeAndUpdate);

router.post("/create", productController.createProduct);
router.get("/getAll", productController.getAllProduct);
router.get("/findProduct/:id", productController.findProductById);
router.get("/findColor/:id", productController.findProductColorById);

//create default product sizes
router.post("/createSizes", productController.createSizes);
module.exports = router;
