const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const bodyParser = require("body-parser");
const Product = require("./model/products");
const Color = require("./model/color");
const Size = require("./model/size");

//routers:
const userRouter = require("./router/users.router");
const productRouter = require("./router/products.router");
const adminRouter = require("./router/admin.router");
const cartRouter = require("./router/carts.router");
const testingRouter = require("./router/testing.router");

require("dotenv").config();
//cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

const app = express();

//enable cors and json
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//connect to mongodb
mongoose.connect(
  "mongodb+srv://Phuc:PhucTLCN2023@cluster0.qeoyr.mongodb.net/eptShop",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// async function handleUpload(file) {
//   const res = await cloudinary.uploader.upload(file, {
//     resource_type: "auto",
//     folder: "e-tpshop",
//   });
//   return res;
// }

// //multer middleware
// const storage = new Multer.memoryStorage();
// const upload = multer({
//   storage,
// });

//upload image
// app.post("/upload", upload.single("my_file"), async (req, res) => {
//   console.log(req.file);
//   try {
//     const b64 = Buffer.from(req.file.buffer).toString("base64");
//     let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
//     const cldRes = await handleUpload(dataURI);
//     res.json(cldRes);
//   } catch (error) {
//     console.log(error);
//     res.send({
//       message: error.message,
//     });
//   }
// });

//base api
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.use("/admin", adminRouter);
app.use("/testing", testingRouter);

const port = process.env.PORT || 5000;

app.listen(port, console.log(`Server is listening to port: ${port}`));

app.post("/getAllProducts", async (req, res) => {
  let resData = [];
  let tempProduct = [];
  let tempColor = [];
  let tempSize = [];

  let products = await Product.find();
  products.map((product) => {
    tempProduct.push(product);
  });

  let colors = await Color.find();
  colors.map((color) => {
    tempColor.push(color);
  });

  let sizes = await Size.find();
  sizes.map((size) => {
    tempSize.push(size);
  });

  return res.status(202).json({
    products: tempProduct,
    colors: tempColor,
    sizes: tempSize,
  });
});
