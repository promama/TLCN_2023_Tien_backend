const User = require("../model/users");

module.exports.test = async (req, res) => {
  var users = await User.find();
  if (users.length == 0) {
    res.json({
      message: "no user found",
    });
  } else {
    res.json({
      users,
    });
  }
};
