const Product = require("../model/products");
const Color = require("../model/color");
const Size = require("../model/size");

//test find size in color
module.exports.findSize = async (req, res) => {
  const productId = req.body.id;
  const productColor = req.body.color;
  var products = await Color.find({ productId, productColor });

  console.log(products[0].sizes);
  // console.log(products[0].sizes[0].productSize);
  // const a = products[0].sizes;
  // console.log(a.length);

  for (let i = 0; i < products[0].sizes.length; i++) {
    console.log(products[0].sizes[i]);
    if (products[0].sizes[i].productSize == req.body.size) {
      return res.json({
        message: "duplicated",
      });
    }
    products[0].sizes.push({
      productSize: req.body.size,
      quantity: req.body.quantity,
      price: req.body.price,
    });

    await products[0].save();
    return res.json({
      message: "not duplicated",
    });
  }
};

//test find size and update single size
module.exports.findSizeAndUpdate = async (req, res) => {
  var productId = req.body.id;
  var productColor = req.body.color;
  var productSize = req.body.size;

  var products = await Color.findOneAndUpdate({
    productId,
    productColor,
    sizes: { productSize },
  });

  console.log(products);
};

//create basic sizes 35-46
//CAUTION: only run once for initialize
module.exports.createSizes = async (req, res) => {
  try {
    for (let i = 35; i < 47; i++) {
      var size = await Size.create({
        productSize: i,
      });
      await size.save();
    }
    res.status(201).json({
      success: true,
      message: "create sizes from 35 to 46 successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err,
    });
  }
};

async function checkDuplicateProduct(productName) {
  var productFound = await Product.find({ name: productName });
  if (productFound.length > 0) {
    return {
      success: true,
      productId: productFound[0]._id,
    };
  } else {
    return {
      success: false,
      message: "no duplicate",
    };
  }
}

async function checkDuplicateColor(productId, productColor) {
  var products = await Color.find({ productId, productColor });
  if (products.length > 0) {
    console.log("color dup");
    return {
      success: true,
      product: products[0],
    };
  } else {
    console.log("not dup");
    return {
      success: false,
    };
  }
}

async function checkDuplicateSize(productId, productColor, productSize) {
  var products = await Color.find({ productId, productColor });

  for (let i = 0; i < products[0].sizes.length; i++) {
    if (products[0].sizes[i].productSize == productSize) {
      return true;
    }
  }
  return false;
}

async function createDBProduct(productProps) {
  var product = await Product.create(productProps);
  await product.save();
  return product;
}

async function createColor(productId, colorProps) {
  var color = await Color.create({
    productId,
    productColor: colorProps.productColor,
    sizes: colorProps.sizes,
    url: colorProps.url,
    url1: colorProps.url1,
    url2: colorProps.url2,
    url3: colorProps.url3,
  });
  await color.save();
  return color;
}

async function createSize(productId, productColor, sizeProps) {
  var products = await Color.find({ productId, productColor });
  try {
    products[0].sizes.push({
      productSize: sizeProps.productSize,
      quantity: sizeProps.quantity,
      price: sizeProps.price,
    });

    await products[0].save();
    return products;
  } catch (err) {
    return json({
      success: false,
      message: err,
    });
  }
}

module.exports.findProductColorById = async (req, res) => {
  try {
    var color = await Color.find(
      { productId: req.params.id },
      "sizes productColor url url1 url2 url3"
    );

    if (color == 0) {
      res.json({
        success: true,
        message: "no color found",
      });
    } else {
      res.json({
        success: true,
        color,
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err,
      data: req.params.id,
    });
  }
};

//create new product
module.exports.createProduct = async (req, res) => {
  var productProps = {
    url: req.body.url,
    name: req.body.name,
    category: req.body.category,
    brand: req.body.brand,
    description: req.body.description,
  };

  var colorProps = {
    productColor: req.body.color,
    url: req.body.url,
    url1: req.body.url1,
    url2: req.body.url2,
    url3: req.body.url3,

    sizes: [
      {
        productSize: req.body.size,
        quantity: req.body.quantity,
        price: req.body.price,
      },
    ],
  };

  var sizeProps = {
    productSize: req.body.size,
    quantity: req.body.quantity,
    price: req.body.price,
  };
  try {
    if (req.body.size < 35 || req.body.size > 46) {
      return res.status(500).json({
        success: false,
        message: "size range must be between 35 and 46",
      });
    } else {
      const isDuplicateProduct = await checkDuplicateProduct(req.body.name);
      if (isDuplicateProduct.success) {
        const isDuplicateColor = await checkDuplicateColor(
          isDuplicateProduct.productId,
          req.body.color
        );
        if (isDuplicateColor.success) {
          const isDuplicateSize = await checkDuplicateSize(
            isDuplicateProduct.productId,
            req.body.color,
            req.body.size
          );

          if (isDuplicateSize) {
            return res.status(500).json({
              success: false,
              message: "product already create",
            });
          } else {
            const size = await createSize(
              isDuplicateProduct.productId,
              req.body.color,
              sizeProps
            );
          }
        } else {
          const color = await createColor(
            isDuplicateProduct.productId,
            colorProps
          );
        }
      } else {
        const product = await createDBProduct(productProps);

        const color = await createColor(product._id, colorProps);
      }

      res.status(201).json({
        message: "create product successfully!",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(501).json({
      message: err,
    });
  }
};

//get all products
module.exports.getAllProduct = async (req, res) => {
  try {
    var products = await Product.find(
      {},
      "_id name category brand price description url color"
    );
    if (products.length == 0) {
      res.json({
        success: true,
        message: "no product found",
      });
    } else {
      //console.log(products);
      for (let i = 0; i < products.length; i++) {
        const price = await Color.find({ productId: products[i]._id });
        products[i].price = price[0].sizes[0].price;
        products[i].url = price[0].url;
      }
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
      const price = await Color.find({ productId: product[0]._id });
      console.log(price[0]);
      product[0].price = price[0].sizes[0].price;
      res.json({
        success: true,
        product,
        color: price[0].productColor,
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
