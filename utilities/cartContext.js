const Size = require("../model/size");
const Color = require("../model/color");

module.exports.verifyQuantity = async (productId, color, size, quantity) => {
  if (quantity <= 0) {
    return {
      success: false,
      message: "quantity must be higher than 0",
    };
  }
  const product = await Color.find({
    productId: productId,
    productColor: color,
  });
  if (product.length < 0) {
    return {
      success: false,
      message: "no product founded",
    };
  }
  if (product.length > 1) {
    return {
      success: false,
      message: "smth wrong duplicate product",
    };
  }

  for (let i = 0; i < product[0].sizes.length; i++) {
    if (
      parseInt(product[0].sizes[i].productSize, 10) == size &&
      product[0].sizes[i].quantity >= quantity
    ) {
      return {
        success: true,
        message: "amount quantity allowed",
      };
    }
  }
  return {
    success: false,
    message: "quantity is invalid",
  };
};

module.exports.verifySize = async (productId, color, size) => {
  const sizes = await Color.find({ productId, productColor: color });
  for (let i = 0; i < sizes[0].sizes[i].productSize; i++) {
    if (parseInt(sizes[0].sizes[i].productSize, 10) == size) {
      return {
        success: true,
        message: "size good",
      };
    }
  }
  return {
    success: false,
    message: "size bad",
  };
};

module.exports.verifyProductId = async (productId) => {
  const product = await Color.find({ productId: productId });

  if (product.length > 0) {
    return {
      success: true,
      message: "product id good",
    };
  }
  return {
    success: false,
    message: `no product have id: ${productId}`,
  };
};

module.exports.verifyProductColor = async (productId, color) => {
  const product = await Color.find({ productId, productColor: color });
  if (product.length > 0) {
    return {
      success: true,
      message: "color good",
    };
  } else {
    return {
      success: false,
      message: "no color match",
    };
  }
};
