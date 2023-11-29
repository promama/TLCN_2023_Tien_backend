const Product = require("../model/products");
const Color = require("../model/color");
const Size = require("../model/size");
const Cart = require("../model/carts");

const mongoose = require("mongoose");
const ProductInCart = require("../model/productincart");

module.exports.subtractToCart = async (req, res) => {
  console.log("top");
  console.log(req.body);
  let subtractTotal = 0;

  const { productId, color, size, quantity, cartInfos } = req.body;

  const pIncart = await ProductInCart.find(
    {
      userId: cartInfos.userId,
      cartId: cartInfos._id,
      productId: productId.id,
      color,
      size,
      status: "In cart",
    },
    "price quantity"
  );

  if (pIncart[0].quantity < quantity) {
    return res.status(500).json({
      success: false,
      message: "subtract more than current is not allow",
    });
  }

  if (pIncart[0].quantity == quantity) {
    await ProductInCart.findOneAndDelete({
      userId: cartInfos.userId,
      cartId: cartInfos._id,
      productId: productId.id,
      color,
      size,
      status: "In cart",
    }).exec();
  }

  subtractTotal = pIncart[0].price * quantity;

  await ProductInCart.findOneAndUpdate(
    {
      userId: cartInfos.userId,
      cartId: cartInfos._id,
      productId: productId.id,
      color,
      size,
      status: "In cart",
    },
    { $inc: { quantity: quantity * -1 } }
  ).exec();

  const c = await Cart.findOneAndUpdate(
    { _id: cartInfos._id },
    { $inc: { total: subtractTotal * -1, quantity: quantity * -1 } },
    { returnOriginal: false }
  ).exec();

  const products = await ProductInCart.find(
    { cartId: cartInfos._id },
    "_id productName url price quantity size color productId"
  );

  return res.status(202).json({
    success: true,
    message: "Added product to cart",
    cart: products,
    total: c.total,
    quantity: c.quantity,
  });
};

module.exports.addToCart = async (req, res) => {
  console.log("top");
  console.log(req.body);

  let checkdup = false; //check duplicate product in cart
  let addedTotal = 0; //add total base on add product to cart: price * quantity
  let price = 0; //price of product
  let isValidProduct = false; //check if product is good to add to cart

  const { productId, color, size, quantity, cartInfos, userId } = req.body;
  console.log(cartInfos);

  const productDetail = await Product.find({ _id: productId.id });
  const colorDetail = await Color.find({
    productId: productId.id,
    productColor: color,
  });

  const product = await Size.find({
    productId: productId.id,
    productColor: color,
    productSize: parseInt(size, 10),
  });

  //check if product existed
  if (product.length == 0) {
    return res.status(500).json({
      success: false,
      message: "No product found",
    });
  }

  //check quantity, if amount quantity is <= 0
  if (quantity < 1) {
    return res.status(500).json({
      success: false,
      message: "product quantity must be greater than 0",
    });
  }

  //validate product
  if (product[0].quantity >= quantity) {
    isValidProduct = true;
  }

  //if size not match or quantity is greater than db
  if (!isValidProduct) {
    return res.status(500).json({
      success: false,
      message: "size or quantity error",
    });
  }

  price = product[0].price;
  addedTotal = price * quantity;

  //add stuff to cart
  console.log("line 60");
  const pInCart = await ProductInCart.find({
    userId: cartInfos.userId,
    cartId: cartInfos._id,
    productId: productId.id,
    color,
    size,
    price,
    status: "In cart",
  });

  try {
    if (pInCart.length == 0) {
      //create new product in cart
      ProductInCart.create({
        userId: cartInfos.userId,
        cartId: cartInfos._id,
        productId: productId.id,
        quantity,
        price,
        color,
        size,
        productName: productDetail[0].name,
        url: colorDetail[0].url,
      });
      const c = await Cart.findOneAndUpdate(
        { _id: cartInfos._id },
        { $inc: { total: addedTotal, quantity: quantity } },
        { returnOriginal: false }
      ).exec();
      console.log(89);
      console.log(c);

      const products = await ProductInCart.find(
        { cartId: cartInfos._id },
        "_id productName url price quantity size color productId"
      );

      return res.status(202).json({
        success: true,
        message: "Added product to cart",
        cart: products,
        total: c.total,
        quantity: c.quantity,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }

  try {
    if (pInCart.length == 1) {
      const p = await ProductInCart.findOneAndUpdate(
        {
          userId: cartInfos.userId,
          cartId: cartInfos._id,
          productId: productId.id,
          color,
          size,
          price,
        },
        {
          $inc: { quantity: quantity },
        }
      );
      const c = await Cart.findOneAndUpdate(
        { _id: cartInfos._id },
        { $inc: { total: addedTotal, quantity: quantity } },
        { returnOriginal: false }
      ).exec();
      console.log(118);
      console.log(c);
      const products = await ProductInCart.find(
        { cartId: cartInfos._id },
        "_id productName url price quantity size color productId"
      );

      return res.status(202).json({
        success: true,
        message: "Added product to cart",
        cart: products,
        total: c.total,
        quantity: c.quantity,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }

  return res.status(500).json({
    success: false,
    message: "smth wrong",
  });
};

//test quantity
module.exports.testAddToCart = async (req, res) => {
  const { productId, color, size, quantity, userId } = req.body;

  let checkdup = false;
  let addedTotal = 0;
  let price = 0;

  const productDetail = await Product.find({ _id: productId });

  const productUrl = await Color.find({
    productId: productId,
    productColor: color,
  });

  for (let i = 0; i < productUrl[0].sizes.length; i++) {
    if (
      parseInt(productUrl[0].sizes[i].productSize, 10) == parseInt(size, 10)
    ) {
      price = productUrl[0].sizes[i].price;
    }
  }

  const cart = await Cart.find({ userId: userId });
  if (cart) {
    console.log(cart[0]);
    for (let i = 0; i < cart[0].products.length; i++) {
      if (
        cart[0].products[i]._id == productId &&
        cart[0].products[i].size == size &&
        cart[0].products[i].color == color &&
        cart[0].products[i].price == price
      ) {
        checkdup = true;
        console.log("dupte");
      }
    }
    console.log("no dup");
  } else {
    res.json({
      message: "no cart found",
    });
  }
  const _id = new mongoose.Types.ObjectId(productId);
  const uId = new mongoose.Types.ObjectId(userId);
  console.log(uId);

  const update = {
    _id: _id,
    quantity: quantity,
    price: price,
    name: productDetail[0].name,
    status: "waiting approve",
    color: color,
    size: size,
    url: productUrl[0].url,
  };
  console.log(update);
  addedTotal = price * quantity;

  let cartAfterUpdate = {};
  if (checkdup) {
    //duplicate, add quantity
    cartAfterUpdate = await Cart.findOneAndUpdate(
      { userId: uId, "products.color": color, "products.size": size },
      { $inc: { total: addedTotal, "products.$.quantity": quantity } }
    );
  } else {
    //not duplicate, add new product
    cartAfterUpdate = await Cart.findOneAndUpdate(
      { userId: uId },
      {
        $push: {
          products: update,
        },
        $inc: {
          total: addedTotal,
        },
      }
    );
  }

  return res.json({
    cartAfterUpdate,
  });
};

//testing
module.exports.testAddOneAndUpdate = async (req, res) => {
  const { productId, color, size, quantity, cartId, userId } = req.body;

  const a = await Color.aggregate([
    {
      $lookup: {
        from: "productincarts",
        localField: "productId",
        foreignField: "productId",
        as: "color_doc",
      },
    },
    // {
    //   $replaceRoot: {
    //     newRoot: {
    //       $mergeObjects: [{ $arrayElemAt: ["$color_doc", 0] }, "$$ROOT"],
    //     },
    //   },
    // },
    // { $project: { color_doc: 0 } },
  ]);

  console.log(a);
  console.log(a[0].color_doc);
  console.log(a[1].color_doc);
};
