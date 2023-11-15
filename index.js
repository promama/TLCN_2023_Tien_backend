const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
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
app.use("/admin", adminRouter);
app.use("/cart", cartRouter);

// //test api
// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     data: 1,
//     message: "connected, welcome to back end",
//   });
// });

// const userSchema = {
//   email: String,
//   password: String,
// };

// const user = mongoose.model("user", userSchema);

// //test api
// app.post("/", (req, res) => {
//   const newUser = new user({
//     email: "abc@gmail.com",
//     password: "123456",
//   });
//   newUser.save();
// });

const port = process.env.PORT || 5000;

app.listen(port, console.log(`Server is listening to port: ${port}`));
