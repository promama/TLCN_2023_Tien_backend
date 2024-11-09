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

const app = express();
const port = process.env.PORT || 5000;

//enable cors and json
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//connect to mongodb
mongoose.connect(
  // "mongodb+srv://Phuc:PhucTLCN2023@cluster0.qeoyr.mongodb.net/eptShop",
  process.env.CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

//socket io for notify
// const server = require("https").createServer(app);
// const io = require("socket.io").listen(server);
// const { Server } = require("socket.io");
// const io = new Server({ cors: { origin: "http://192.168.0.104:8081" } });
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected :D");
  socket.on("chat message", (msg) => {
    console.log(msg);
    io.emit("server saying: ", `i can hear you saying: ${msg}`);
  });
});

server.listen(5001, () => {
  console.log("socket listen to port 5001");
});

//base api
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.use("/admin", adminRouter);
app.use("/testing", testingRouter);

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
