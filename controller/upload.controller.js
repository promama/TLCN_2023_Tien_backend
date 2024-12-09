const cloudinary = require("cloudinary").v2;
var multer = require("multer");

// require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//cloudinary root folder store every images
const cloudinaryRoot = process.env.CLOUDINARY_ROOT;
var storage = new multer.memoryStorage();
module.exports.upload = multer({ storage });

async function handleUpload(file, folderName, folderColor) {
  try {
    if (folderName && folderColor) {
      const res = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
        folder: `${cloudinaryRoot}/${folderName}/${folderColor}`,
      });
      return res;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
  return false;
}

module.exports.uploadCloudinary = async (req, res, next) => {
  try {
    console.log(JSON.parse(req.body?.productData));
  } catch (err) {
    return res.status(400).json({
      message: "Please choose 1 up to 4 image(s) to upload",
    });
  }
  const request = JSON.parse(req.body?.productData);
  const {
    folderName,
    folderColor,
    brand,
    category,
    description,
    size,
    quantity,
    price,
  } = request;
  let listURL = [];

  if (req.files == undefined || req.files == "") {
    return res.status(400).json({ success: false, message: "no file found" });
  }
  try {
    req.files.map((file) => {
      console.log(file);
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err });
  }

  for (let i = 0; i < req.files.length; i++) {
    const b64 = Buffer.from(req.files[i].buffer).toString("base64");
    let dataURI = "data:" + req.files[i].mimetype + ";base64," + b64;
    const cldRes = await handleUpload(
      dataURI,
      folderName,
      folderColor.replace("#", "")
    );
    if (cldRes == false) {
      return res.json({
        success: false,
        message: "upload not working",
      });
    }
    listURL.push(cldRes.secure_url);
  }

  //set body for next
  req.body.name = folderName;
  req.body.color = folderColor;
  req.body.brand = brand;
  req.body.category = category;
  req.body.description = description;
  req.body.size = parseInt(size);
  req.body.quantity = parseInt(quantity);
  req.body.price = parseInt(price);
  req.body.url = listURL[0];
  req.body.url1 = listURL[1];
  req.body.url2 = listURL[2];
  req.body.url3 = listURL[3];

  next();
};

module.exports.uploadColor = async (req, res, next) => {
  try {
    console.log(JSON.parse(req.body?.productData));
  } catch (err) {
    return res.status(400).json({
      message: "Please choose 1 up to 4 image(s) to upload",
    });
  }
  const request = JSON.parse(req.body?.productData);
  const { folderName, folderColor, productId } = request;
  let listURL = [];

  if (req.files == undefined || req.files == "") {
    return res.status(400).json({ success: false, message: "no file found" });
  }
  try {
    req.files.map((file) => {
      console.log(file);
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err });
  }

  for (let i = 0; i < req.files.length; i++) {
    const b64 = Buffer.from(req.files[i].buffer).toString("base64");
    let dataURI = "data:" + req.files[i].mimetype + ";base64," + b64;
    const cldRes = await handleUpload(
      dataURI,
      folderName,
      folderColor.replace("#", "")
    );
    if (cldRes == false) {
      return res.json({
        success: false,
        message: "upload not working",
      });
    }
    listURL.push(cldRes.secure_url);
  }

  //set body for next
  req.body.name = folderName;
  req.body.color = folderColor;
  req.body.productId = productId;
  req.body.url = listURL[0];
  req.body.url1 = listURL[1];
  req.body.url2 = listURL[2];
  req.body.url3 = listURL[3];

  next();
};

function handleRetrivePathFromUrl(url) {
  //https://res.cloudinary.com/promama/image/upload/v1705636365/e-tpshop/NewFolder/White/p8gxdxufyxxyqxujhoyr.jpg
  const source = url.toString();
  const words = source.split("e-tpshop");
  const removedSuffix = words[1].split(".");
  const result = cloudinaryRoot + removedSuffix[0];

  return decodeURI(result);
}

const handleDeleteSingleFileCloudinary = async (url) => {
  try {
    const result = handleRetrivePathFromUrl(url);
    console.log(result);
    await cloudinary.api.delete_resources([result], {
      type: "upload",
      resource_type: "image",
    });
    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      message: err,
    };
  }
};

module.exports.deleteSingleFileCloudinary = async (req, res) => {
  const { url } = req.body;

  const result = await handleDeleteSingleFileCloudinary(url);
  return res.json({
    success: result.success,
  });
};

module.exports.uploadDeliveringImage = async (req, res, next) => {
  // try {
  //   console.log(JSON.parse(req.body?.deliverData));
  // } catch (err) {
  //   return res.status(400).json({
  //     message: "Please choose an image to upload",
  //   });
  // // }
  // const request = JSON.parse(req.body?.deliverData);
  // const { orderId, email } = request;
  let listURL = [];

  if (req.files == undefined || req.files == "") {
    return res.status(400).json({ success: false, message: "no file found" });
  }
  try {
    req.files.map((file) => {
      console.log(file);
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err });
  }

  for (let i = 0; i < req.files.length; i++) {
    const b64 = Buffer.from(req.files[i].buffer).toString("base64");
    let dataURI = "data:" + req.files[i].mimetype + ";base64," + b64;
    const cldRes = await handleUpload(dataURI, "deliver", req.body.email);
    if (cldRes == false) {
      return res.json({
        success: false,
        message: "upload not working",
      });
    }
    listURL.push(cldRes.secure_url);
  }

  // //set body for next
  req.body.url = listURL[0];

  next();
};

exports.handleDeleteSingleFileCloudinary = handleDeleteSingleFileCloudinary;
