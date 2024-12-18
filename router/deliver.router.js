var express = require("express");
var router = express.Router();
var deliverController = require("../controller/deliver.controller");
const {
  upload,
  uploadCloudinary,
  uploadDeliveringImage,
} = require("../controller/upload.controller");

router.post("/login", deliverController.loginDeliver);
router.post("/signup", deliverController.createDeliver);

router.post("/testCreateToken", deliverController.testCreateToken);

router.post(
  "/uploadImage",
  upload.array("myFiles", 1),
  uploadDeliveringImage,
  deliverController.finishDeliverOrder,
  deliverController.showMyDeliveringOrder
);
//middleware verify token
router.use(deliverController.verifyDeliver);

router.post("/showDeliveringOrder", deliverController.showMyDeliveringOrder);
router.post("/showSuccessOrder", deliverController.showMyDeliveringSuccess);
router.post("/showCancelOrder", deliverController.showMyDeliveringCancel);

router.post("/verify", deliverController.checkDeliver);
router.post("/showAllOrder", deliverController.showAllOrder);
router.post("/showOrderDetail", deliverController.showOrderDetail);
router.post("/showAllNotificatioin", deliverController.showAllNotification);
router.post(
  "/readNotify",
  deliverController.markAsReadNotification,
  deliverController.showAllNotification
);
router.post(
  "/takeOrder",
  deliverController.takeOrder,
  deliverController.showAllOrder
);
router.post(
  "/cancelOrder",
  deliverController.cancelOrder,
  deliverController.showMyDeliveringOrder
);

module.exports = router;
