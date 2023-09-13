var express = require("express");
var router = express.Router();

var productController = require("../controller/products.controller");

router.post("/create", productController.createProduct);
router.get("/getAll", productController.getAllProduct);
module.exports = router;
