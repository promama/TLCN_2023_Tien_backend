const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const bodyParser = require("body-parser");
const Product = require("./model/products");
const Color = require("./model/color");
const Size = require("./model/size");
const User = require("./model/users");

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
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const {
  verifyManagerToken,
  decodeUserToken,
} = require("./controller/auth.controller");
const { instrument } = require("@socket.io/admin-ui");
const Notification = require("./model/notification");

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "https://admin.socket.io",
    ],
  },
});

instrument(io, {
  auth: false,
});

io.on("connection", (socket) => {
  console.log("a user connected :D with socketId: ");

  //user join a room name user's email
  socket.on("user:join", async (msg) => {
    console.log(msg);
    socket.join(msg.room);
    socket.to(msg.room).emit("server:acceptjoin", {
      message: `allow join room mychat `,
      success: true,
    });
  });

  //manager join a room name manager's email
  socket.on("manager:join", async () => {
    socket.join("manager");
    socket.to("manager").emit("server:acceptjoin", {
      message: `welcome manager join room manager`,
      success: true,
    });
  });

  //user confirm buy order
  socket.on("user:confirm-order", async (message) => {
    console.log(message);
    const newId = new mongoose.Types.ObjectId();
    await Notification.create({
      _id: newId,
      isRead: true,
      email: message.email,
      status: "Waiting approve",
      orderId: message.orderId,
    });
    const userNoti = await Notification.find({ email: message.email });
    socket.to(message.email).emit("server:confirmed-order", {
      message: "you have confirmed your order, waiting for approve",
      notify: userNoti,
    });
    //emit to manager room that user confirm and buy order
    //return new notify to admin too
    const managerNoti = await Notification.find();
    socket.to("manager").emit("server:user-confirm-order", {
      message: "a user is confirm a new order",
      notify: managerNoti,
    });
  });

  //admin approve order
  socket.on("manager:approve-order", async (message) => {
    console.log(message);
    const newId = new mongoose.Types.ObjectId();
    const user = await User.find({ _id: message.orderDetail.userId }, "email");
    console.log(user[0]);
    await Notification.create({
      _id: newId,
      isRead: false,
      email: user[0].email,
      status: "Delivering",
      orderId: message.orderDetail.orderId,
    });
    const userNoti = await Notification.find({ email: user[0].email });
    socket.to(user[0].email).emit("server:manager-approved-order", {
      message: "your order is approved by manager",
      notify: userNoti,
    });
  });

  //user finish order
  socket.on("user:finish-order", async (message) => {
    console.log(message);
    const newId = new mongoose.Types.ObjectId();
    await Notification.create({
      _id: newId,
      isRead: true,
      email: message.email,
      status: "Finish",
      orderId: message.orderId.orderId,
    });
    const userNoti = await Notification.find({ email: message.email });
    socket.to(message.email).emit("server:finish-order", {
      message: "you have finished your order, thank you for your buying",
      notify: userNoti,
    });
    //emit to manager room that user finish
    //return new notify to admin too
    const managerNoti = await Notification.find();
    socket.to("manager").emit("server:user-finish-order", {
      message: "a user is finish an order",
      notify: managerNoti,
    });
  });

  //testing space below

  //sent to room from admin
  socket.on("user:send-to-room", async (message) => {
    console.log(message);
    socket.to(message.room).emit("server:acceptjoin", {
      message: "hey",
    });
  });

  //listen to client
  socket.on("chat message", (msg) => {
    console.log(msg.message);
    //send message to client
    io.to(msg.socketId).emit(
      "server saying: ",
      `i can hear ${msg.socketId} saying: ${msg.message}`
    );
  });
  //listen to "admin:saying"
  socket.on("admin:saying", async (msg) => {
    // console.log(msg.token);
    const result = await verifyManagerToken(msg.token);
    console.log(result);
    io.to(msg.socketId).emit("server:saying", { result });
  });
  //list to "user:verify"
  socket.on("user:verify", async (msg) => {
    const tokenDecoded = await decodeUserToken(msg?.token);
    console.log(tokenDecoded);
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
