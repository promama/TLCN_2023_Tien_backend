const Product = require("../model/products");
const Color = require("../model/color");
const Size = require("../model/size");
const Category = require("../model/category");
const Brand = require("../model/brand");

const { handleDeleteSingleFileCloudinary } = require("./upload.controller");
const ProductInCart = require("../model/productincart");

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
  console.log("checking product duplicate");
  console.log("product name: " + productName);
  var productFound = await Product.find({ name: productName });
  if (productFound.length > 0) {
    console.log("product dup");
    return {
      success: true,
      productId: productFound[0]._id,
    };
  } else {
    console.log("product not dup");
    return {
      success: false,
      message: "no duplicate",
    };
  }
}

async function checkDuplicateColor(productId, productColor) {
  console.log("checking size duplicate");
  console.log("product id: " + productId);
  console.log("product color: " + productColor);
  var products = await Color.find({ productId, productColor });
  if (products.length > 0) {
    console.log("color dup");
    return {
      success: true,
      product: products[0],
    };
  } else {
    console.log("color not dup");
    return {
      success: false,
    };
  }
}

async function checkDuplicateSize(productId, productColor, productSize) {
  console.log("checking product duplicate");
  console.log("product id: " + productId);
  console.log("product color: " + productColor);
  console.log("product size: " + productSize);
  var products = await Size.find({ productId, productColor, productSize });
  if (products.length > 0) {
    console.log("size dup");
    return true;
  }
  console.log("size not dup");
  return false;
}

module.exports.findProductColorById = async (req, res) => {
  try {
    var color = await Color.find(
      { productId: req.params.id },
      "productColor url url1 url2 url3"
    );

    if (color == 0) {
      return res.json({
        success: true,
        message: "no color found",
      });
    }

    const size = await Size.find(
      {
        productId: req.params.id,
      },
      "productSize productColor"
    ).sort({ productColor: "asc", productSize: "asc" });

    return res.json({
      success: true,
      color,
      size,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
      data: req.params.id,
    });
  }
};

//create new product (old)
module.exports.acreateProduct = async (req, res) => {
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

async function createDBProduct(name, price, category, brand, description, url) {
  const p = await Product.create({
    name,
    price,
    category,
    brand,
    description,
    url,
  });
  await p.save();
  return p;
}

async function createColor(
  productId,
  productName,
  productColor,
  url,
  url1,
  url2,
  url3
) {
  const c = await Color.create({
    productId: productId,
    productName,
    productColor,
    url,
    url1,
    url2,
    url3,
  });
  await c.save();
  return c;
}

async function createSize(
  productId,
  productColor,
  productSize,
  quantity,
  price
) {
  const s = await Size.create({
    productId: productId,
    productColor,
    productSize,
    quantity,
    price,
  });
  await s.save();
  return s;
}

async function createCategoryBrand(category, brand) {
  const catFound = await Category.find({ name: category });
  if (catFound.length < 1) {
    const c = Category.create({ name: category });
  }

  const braFound = await Brand.find({ name: brand });
  if (braFound.length < 1) {
    const b = Brand.create({ name: brand });
  }
}

//create new product
module.exports.createProduct = async (req, res) => {
  const {
    name,
    category,
    brand,
    description,
    color,
    size,
    quantity,
    price,
    url,
    url1,
    url2,
    url3,
    token,
  } = req.body;

  if (size < 35 || size > 46) {
    handleDeleteSingleFileCloudinary(url);
    handleDeleteSingleFileCloudinary(url1);
    handleDeleteSingleFileCloudinary(url2);
    handleDeleteSingleFileCloudinary(url3);
    return res.status(500).json({
      success: false,
      message: "size range must be between 35 and 46",
    });
  }

  const isDuplicateProduct = await checkDuplicateProduct(name);
  if (!isDuplicateProduct.success) {
    try {
      //create a brand new product, color, size. category and brand are optional if new
      const p = await createDBProduct(
        name,
        price,
        category,
        brand,
        description,
        url
      );
      await createColor(p._id, name, color, url, url1, url2, url3);
      await createSize(p._id, color, size, quantity, price);
      await createCategoryBrand(category, brand);

      const allProduct = await Product.find();
      const allColor = await Color.find();
      const allSize = await Size.find();

      return res.json({
        success: true,
        message: "create product success 1",
        allProduct,
        allColor,
        allSize,
      });
    } catch (err) {
      handleDeleteSingleFileCloudinary(url);
      handleDeleteSingleFileCloudinary(url1);
      handleDeleteSingleFileCloudinary(url2);
      handleDeleteSingleFileCloudinary(url3);
      return res.json({
        success: false,
        message: err,
      });
    }
  }

  const isDuplicateColor = await checkDuplicateColor(
    isDuplicateProduct.productId,
    color
  );
  if (!isDuplicateColor.success) {
    try {
      //create new color and size of existed product. category and brand are optional if new
      await createColor(
        isDuplicateProduct.productId,
        name,
        color,
        url,
        url1,
        url2,
        url3
      );
      await createSize(
        isDuplicateProduct.productId,
        color,
        size,
        quantity,
        price
      );
      await createCategoryBrand(category, brand);

      const allProduct = await Product.find();
      const allColor = await Color.find();
      const allSize = await Size.find();

      return res.json({
        success: true,
        message: "create product success 2",
        allProduct,
        allColor,
        allSize,
      });
    } catch (err) {
      handleDeleteSingleFileCloudinary(url);
      handleDeleteSingleFileCloudinary(url1);
      handleDeleteSingleFileCloudinary(url2);
      handleDeleteSingleFileCloudinary(url3);
      return res.json({
        success: false,
        message: err,
      });
    }
  }

  const isDuplicateSize = await checkDuplicateSize(
    isDuplicateProduct.productId,
    color,
    size
  );

  if (!isDuplicateSize) {
    try {
      //create new size for product, color. category and brand are optional if new
      await createSize(
        isDuplicateProduct.productId,
        color,
        size,
        quantity,
        price
      );

      const allProduct = await Product.find();
      const allColor = await Color.find();
      const allSize = await Size.find();

      await createCategoryBrand(category, brand);
      return res.json({
        success: true,
        message: "create product success 3",
        allProduct,
        allColor,
        allSize,
      });
    } catch (err) {
      handleDeleteSingleFileCloudinary(url);
      handleDeleteSingleFileCloudinary(url1);
      handleDeleteSingleFileCloudinary(url2);
      handleDeleteSingleFileCloudinary(url3);
      return res.json({
        success: false,
        message: err,
      });
    }
  }
  handleDeleteSingleFileCloudinary(url);
  handleDeleteSingleFileCloudinary(url1);
  handleDeleteSingleFileCloudinary(url2);
  handleDeleteSingleFileCloudinary(url3);
  return res.status(500).json({
    success: false,
    message: "product name, color, size duplicated, please change any of them",
  });
};

//create new color
module.exports.createColor = async (req, res) => {
  const { productId, name, color, url, url1, url2, url3, token } = req.body;
  console.log(req.body);

  const isDuplicateColor = await checkDuplicateColor(productId, color);
  if (!isDuplicateColor.success) {
    try {
      await createColor(productId, name, color, url, url1, url2, url3);
      const colors = await Color.find();

      return res.status(200).json({
        success: true,
        message: "create color success ",
        colors,
      });
    } catch (err) {
      handleDeleteSingleFileCloudinary(url);
      handleDeleteSingleFileCloudinary(url1);
      handleDeleteSingleFileCloudinary(url2);
      handleDeleteSingleFileCloudinary(url3);
      return res.status(400).json({
        success: false,
        message: err,
      });
    }
  }

  handleDeleteSingleFileCloudinary(url);
  handleDeleteSingleFileCloudinary(url1);
  handleDeleteSingleFileCloudinary(url2);
  handleDeleteSingleFileCloudinary(url3);
  return res.status(500).json({
    success: false,
    message: "Color is already exist, please choose another one",
  });
};

//get all products (old)
module.exports.getAllProduct = async (req, res) => {
  try {
    var products = await Product.find(
      {},
      "_id name category brand price description url"
    );
    if (products.length == 0) {
      return res.json({
        success: true,
        message: "no product found",
      });
    }
    //console.log(products);
    return res.json({
      success: true,
      products,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: err,
    });
  }
};

//get 1 product by id (old)
module.exports.findProductById = async (req, res) => {
  try {
    var product = await Product.find(
      { _id: req.params.id },
      "_id name url category brand price description"
    );
    if (product == 0) {
      return res.json({
        success: true,
        message: "no product found",
      });
    } else {
      const price = await Color.find({ productId: product[0]._id });
      return res.json({
        success: true,
        product,
        color: price[0].productColor,
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      message: err,
      data: req.params.id,
    });
  }
};

//update productName
module.exports.updateProductName = async (req, res) => {
  const { productId, productName } = req.body;

  if (String(productName).trim() == "") {
    return res.status(400).json({
      success: false,
      message: "Name invalid",
    });
  }
  try {
    await Product.updateMany(
      { _id: productId },
      { $set: { name: productName } }
    );
    await Color.updateMany(
      { productId: productId },
      { $set: { productName: productName } }
    );
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err,
    });
  }
  const products = await Product.find();
  const colors = await Color.find();

  return res.status(200).json({
    products,
    colors,
    success: true,
    message: "update product name successfully",
  });
};

//update productBrand
module.exports.updateProductBrand = async (req, res) => {
  const { productId, productBrand } = req.body;
  let oldProductBrand = "";

  if (String(productBrand).trim() == "") {
    return res.status(400).json({
      success: false,
      message: "Brand invalid",
    });
  }

  try {
    const product = await Product.find({ _id: productId });
    oldProductBrand = product[0].brand;
    console.log("old brand: " + oldProductBrand);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: err,
    });
  }

  //check if not have old brand, then create new brand
  try {
    const brand = await Brand.find({ name: productBrand });
    if (brand.length < 1) {
      const createNewBrand = await Brand.create({ name: productBrand });
      await createNewBrand.save();
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: err,
    });
  }

  try {
    await Product.updateMany(
      { _id: productId },
      { $set: { brand: productBrand } }
    );
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: err,
    });
  }
  const products = await Product.find();

  return res.status(200).json({
    products,
    success: true,
    message: "update brand successfully",
  });
};

module.exports.updateProductCategory = async (req, res) => {
  const { productId, productCategory } = req.body;
  let oldProductCategory = "";

  if (String(productCategory).trim() == "") {
    return res.status(400).json({
      success: false,
      message: "Category invalid",
    });
  }

  try {
    const product = await Product.find({ _id: productId });
    oldProductCategory = product[0].category;
    console.log("old category: " + oldProductCategory);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: err,
    });
  }

  //check if not have old brand, then create new brand
  try {
    const category = await Category.find({ name: productCategory });
    if (category.length < 1) {
      const createNewCategory = await Category.create({
        name: productCategory,
      });
      await createNewCategory.save();
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: err,
    });
  }

  try {
    await Product.updateMany(
      { _id: productId },
      { $set: { category: productCategory } }
    );
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: err,
    });
  }
  const products = await Product.find();

  return res.status(200).json({
    products,
    success: true,
    message: "update category successfully",
  });
};

module.exports.updateProductSize = async (req, res) => {
  const { sizeId, productId, productColor, size, quantity, price } = req.body;

  if (size < 35 || size > 46) {
    return res.status(500).json({
      success: false,
      message: "size range must be between 35 and 46",
    });
  }

  if (quantity < 1 || price < 0) {
    return res.status(500).json({
      success: false,
      message: "Quantity or price is invalid",
    });
  }

  try {
    const duplicateSize = await Size.find({
      productId,
      productColor,
      productSize: size,
    });

    if (duplicateSize.length > 0) {
      return res.status(400).json({
        success: false,
        message: "New size is duplicate, please choose another size",
      });
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err,
    });
  }

  try {
    const updatedSize = await Size.findOneAndUpdate(
      { _id: sizeId },
      { $set: { productSize: size, quantity, price } }
    );
    console.log(updatedSize);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err,
    });
  }

  const sizes = await Size.find();

  return res.status(200).json({
    success: true,
    message: "Update size successfully",
    sizes,
  });
};

module.exports.updateProductColor = async (req, res) => {
  const { colorId, productColor } = req.body;
  console.log(req.body);

  if (toString(colorId).trim() == "" || toString(productColor).trim() == "") {
    return res.status(400).json({
      success: false,
      message: "Product must have color",
    });
  }

  try {
    await Color.updateMany({ _id: colorId }, { $set: { productColor } });
  } catch (err) {}

  const colors = await Color.find();

  return res.status(200).json({
    success: true,
    message: "Update color successfully!",
    colors,
  });
};

module.exports.addProductSize = async (req, res) => {
  const { productId, productColor, size, quantity, price } = req.body;

  if (size < 35 || size > 46) {
    return res.status(500).json({
      success: false,
      message: "size range must be between 35 and 46",
    });
  }

  if (quantity < 1 || price < 1) {
    return res.status(500).json({
      success: false,
      message: "Quantity or price is invalid",
    });
  }

  const checkDuplicateSize = await Size.find({
    productId,
    productColor,
    productSize: size,
  });
  if (checkDuplicateSize.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Size already create",
    });
  }

  try {
    await createSize(productId, productColor, size, quantity, price);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Fail to create size, please try again",
    });
  }

  const sizes = await Size.find();

  console.log(req.body);
  return res.status(200).json({
    success: true,
    message: "Create size successfully",
    sizes,
  });
};

module.exports.deleteProductSize = async (req, res) => {
  const { sizeId, productId, productColor, size } = req.body;

  const isBuying = await ProductInCart.find({
    status: "In cart",
    productId,
    color: productColor,
    size,
  });

  if (isBuying.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Product is still in someone cart, cannot delete this size",
    });
  }

  try {
    await Size.deleteMany({ _id: sizeId });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Something when wrong",
    });
  }

  const sizes = await Size.find();

  return res.status(200).json({
    success: true,
    message: "Delete size successfully",
    sizes,
  });
};

module.exports.deleteProductColor = async (req, res) => {
  const { productId, productColor, productName } = req.body;
  console.log(req.body);

  const isBuying = await ProductInCart.find({
    status: "In cart",
    productId,
    color: productColor,
  });

  if (isBuying.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Product is still in someone cart, cannot delete this color",
    });
  }
  //delete image in cloudinary
  try {
    await Color.deleteMany({ productId, productColor });
    await Size.deleteMany({ productId, productColor });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Something when wrong",
    });
  }

  const colors = await Color.find();
  const sizes = await Size.find();

  return res.status(200).json({
    success: true,
    message: "Delete size successfully",
    sizes,
    colors,
  });
};
