const Product = require("../model/products");

//create new product
module.exports.createProduct = async (req, res) => {
  try {
    var product = await Product.create({
      url: req.body.url,
      name: req.body.name,
      category: req.body.category,
      brand: req.body.brand,
      description: req.body.description,
      price: req.body.price,
      remain: req.body.remain,
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

//get all products
module.exports.getAllProduct = async (req, res) => {
  try {
    var products = await Product.find(
      {},
      "_id name url category brand price remain description"
    );
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

//get 1 product by id
module.exports.findProductById = async (req, res) => {
  try {
    var product = await Product.find(
      { _id: req.params.id },
      "_id name url category brand price remain description"
    );
    if (product == 0) {
      res.json({
        success: true,
        message: "no product found",
      });
    } else {
      res.json({
        success: true,
        product,
      });
    }
  } catch (err) {
    res.json({
      success: false,
      message: err,
      data: req.params.id,
    });
  }
};
