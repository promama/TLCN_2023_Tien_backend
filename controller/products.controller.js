const Product = require("../model/products");

module.exports.createProduct = async (req, res) => {
  try {
    var product = await Product.create({
      url: req.body.url,
      name: req.body.name,
      category: req.body.category,
      brand: req.body.brand,
      description: req.body.desctription,
      price: req.body.price,
    });
    await product.save();
    res.status(201).json({
      message: "success",
      data: product,
    });
  } catch (err) {
    console.log(err);
    res.json({
      message: err,
    });
  }
};

module.exports.getAllProduct = async (req, res) => {
  try {
    var products = await Product.find();
    if (products == 0) {
      res.json({
        success: true,
        message: "no product found",
      });
    } else {
      res.json({
        success: true,
        products,
      });
    }
  } catch (err) {
    res.json({
      success: false,
      message: err,
    });
  }
};
