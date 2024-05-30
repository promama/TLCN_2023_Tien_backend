const Product = require("../model/products");
const Color = require("../model/color");
const Size = require("../model/size");
const Cart = require("../model/carts");

const mongoose = require("mongoose");
const ProductInCart = require("../model/productincart");
const Order = require("../model/order");

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
    "price quantity orderId"
  );

  if (!pIncart) {
    return res.status(500).json({
      success: false,
      message: "Signin again",
    });
  }

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
  } else {
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
  }

  subtractTotal = pIncart[0].price * quantity;

  const c = await Cart.findOneAndUpdate(
    { _id: cartInfos._id },
    { $inc: { total: subtractTotal * -1, quantity: quantity * -1 } },
    { returnOriginal: false }
  ).exec();
  await Order.findOneAndUpdate(
    { cartId: cartInfos._id, status: "In cart" },
    { $set: { total: c.total } }
  ).exec();

  const products = await ProductInCart.find(
    { cartId: cartInfos._id, status: "In cart" },
    "_id productName url price quantity size color productId"
  );

  if (req.body.deleteSize) {
    next();
  }

  return res.status(202).json({
    success: true,
    message: "subtracted product to cart",
    cart: products,
    total: c.total,
    orderId: pIncart[0].orderId,
    quantity: c.quantity,
    token: req.body.token,
  });
};

module.exports.addToCart = async (req, res) => {
  console.log("top");
  console.log(req.body);

  let checkdup = false; //check duplicate product in cart
  let addedTotal = 0; //add total base on add product to cart: price * quantity
  let price = 0; //price of product
  let isValidProduct = false; //check if product is good to add to cart
  let productDetail;
  let colorDetail;
  let product;

  const { productId, color, size, quantity, cartInfos, userId } = req.body;
  console.log(cartInfos);

  try {
    productDetail = await Product.find({ _id: productId.id });
  } catch {
    return res.status(500).json({
      success: false,
      message: "can't find productDetail",
    });
  }
  try {
    colorDetail = await Color.find({
      productId: productId.id,
      productColor: color,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "can't find colorDetail",
    });
  }

  try {
    product = await Size.find({
      productId: productId.id,
      productColor: color,
      productSize: parseInt(size, 10),
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "can't find product",
    });
  }

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

  //check order status
  //if status != "In cart"
  //create new order
  let order = new mongoose.Types.ObjectId();
  try {
    const newOrder = new mongoose.Types.ObjectId();
    order = newOrder;
    const orderInfos = await Order.find({
      userId: cartInfos.userId,
      status: "In cart",
    });

    console.log("order: ");
    console.log(orderInfos);
    if (orderInfos.length == 0) {
      //create order with userId
      await Order.create({
        _id: order,
        userId: cartInfos.userId,
        status: "In cart",
      });
    } else {
      order = orderInfos[0]._id;
    }
  } catch (err) {
    console.log(err);
  }

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
        orderId: order,
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

      await Order.findOneAndUpdate(
        { userId: cartInfos.userId, status: "In cart" },
        { total: c.total, cartId: cartInfos._id }
      ).exec();
      console.log(89);
      console.log(c);

      const products = await ProductInCart.find(
        { cartId: cartInfos._id, status: "In cart" },
        "_id productName url price quantity size color productId"
      );

      return res.status(202).json({
        success: true,
        message: "Added product to cart",
        orderId: order,
        cart: products,
        total: c.total,
        quantity: c.quantity,
        token: req.body.token,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err,
    });
  }

  //if product already in cart
  //add amount quantity
  try {
    if (pInCart.length == 1) {
      await ProductInCart.findOneAndUpdate(
        {
          userId: cartInfos.userId,
          cartId: cartInfos._id,
          productId: productId.id,
          color,
          size,
          price,
          status: "In cart",
        },
        {
          $inc: { quantity: quantity },
        }
      ).exec();
      const c = await Cart.findOneAndUpdate(
        { _id: cartInfos._id },
        { $inc: { total: addedTotal, quantity: quantity } },
        { returnOriginal: false }
      ).exec();
      await Order.findOneAndUpdate(
        { userId: cartInfos.userId, status: "In cart" },
        { total: c.total, cartId: cartInfos._id }
      ).exec();
      console.log(118);
      console.log(c);
      const products = await ProductInCart.find(
        { cartId: cartInfos._id, status: "In cart" },
        "_id productName url price quantity size color productId"
      );

      return res.status(202).json({
        success: true,
        message: "Added product to cart",
        orderId: order,
        cart: products,
        total: c.total,
        quantity: c.quantity,
        token: req.body.token,
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

module.exports.showCartItems = async (req, res) => {
  console.log("showingCartItems");
  console.log(req.body);
  const { cartInfos } = req.body;

  try {
    const c = await Cart.find({ _id: cartInfos._id });

    const products = await ProductInCart.find(
      { cartId: cartInfos._id, status: "In cart" },
      "_id productName url price quantity size color productId"
    );
    console.log("here");
    console.log(c);
    if (products.length < 1) {
      return res.status(202).json({
        success: true,
        cart: products,
        total: 0,
        quantity: 0,
        message: "ok",
      });
    }
    return res.status(202).json({
      success: true,
      cart: products,
      total: c[0].total,
      quantity: c[0].quantity,
      message: "ok",
    });
  } catch (err) {
    return res.status(500).json({
      succes: false,
      message: "signin again",
    });
  }
};

module.exports.checkIsAddable = async (req, res, next) => {
  console.log(req.body);
  //find if product is in cart
  const product = await ProductInCart.find({
    productId: req.body.productId.id,
    color: req.body.color,
    size: req.body.size,
    status: "In cart",
  });

  if (product.length < 1) {
    return next();
  }

  console.log(product);

  const size = await Size.find({
    productId: req.body.productId.id,
    productColor: req.body.color,
    productSize: req.body.size,
  });

  if (size.length < 1) {
    return res.status(500).json({
      success: false,
      message: "signin again",
    });
  }

  if (size[0].quantity < parseInt(req.body.quantity) + product[0].quantity) {
    return res.status(500).json({
      success: false,
      message: "You can't buy more than stock",
    });
  }
  next();
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
