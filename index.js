const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
const Multer = require("multer");

require("dotenv").config();

const app = express();

//enable cors and json
app.use(express.json());
app.use(cors());

//routers:
const userRouter = require("./router/users.router");
const productRouter = require("./router/products.router");
const adminRouter = require("./router/admin.router");
const cartRouter = require("./router/carts.router");
const testingRouter = require("./router/testing.router");

//connect to mongodb
mongoose.connect(
  "mongodb+srv://Phuc:PhucTLCN2023@cluster0.qeoyr.mongodb.net/eptShop",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//user api
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.use("/admin", adminRouter);
app.use("/testing", testingRouter);

const port = process.env.PORT || 5000;

app.listen(port, console.log(`Server is listening to port: ${port}`));
