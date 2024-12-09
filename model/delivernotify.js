const mongoose = require("mongoose");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(customParseFormat);

const delivernotifySchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  email: {
    type: String,
    match:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  status: { type: String, require: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "orders" },
  isRead: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now },
  last_update: { type: Date, default: Date.now },
});

const Delivernotify = mongoose.model(
  "Delivernotifys",
  delivernotifySchema,
  "delivernotifys"
);
module.exports = Delivernotify;
