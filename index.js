const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(
  "mongodb+srv://Phuc:PhucTLCN2023@cluster0.qeoyr.mongodb.net/eptShop",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "connected, welcome to back end",
  });
});

const userSchema = {
  email: String,
  password: String,
};

const user = mongoose.model("user", userSchema);

app.post("/", (req, res) => {
  const newUser = new user({
    email: "abc@gmail.com",
    password: "123456",
  });
  newUser.save();
});

const port = process.env.PORT || 5000;

app.listen(port, console.log(`Server is listening to port: ${port}`));
