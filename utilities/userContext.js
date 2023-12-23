const User = require("../model/users");

module.exports.checkPhoneNumberFormat = (phoneNumber) => {
  var regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  try {
    if (phoneNumber.match(regex)) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

module.exports.checkGender = (gender) => {
  if (gender != "Female" && gender != "Male") {
    return false;
  }
  return true;
};

module.exports.checkRole = (role) => {
  if (role != "User" && role != "Manager") {
    return false;
  }
  return true;
};

module.exports.checkStatus = (status) => {
  if (status != "Active" && status != "Suspended" && status != "Banned") {
    return false;
  }
  return true;
};

module.exports.verifyPhoneGenderRoleStatus = (
  phoneNumber,
  gender,
  role,
  status
) => {
  if (
    this.checkPhoneNumberFormat(phoneNumber) &&
    this.checkGender(gender) &&
    this.checkRole(role) &&
    this.checkStatus(status)
  )
    return true;
  return false;
};

module.exports.checkUserExisted = async (_id) => {
  const userFounded = User.find(_id);
  if (!userFounded) {
    return false;
  }
  return true;
};
