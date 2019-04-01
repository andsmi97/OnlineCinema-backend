const authController = require("../../controllers/auth");
const express = require("express");
const router = express.Router();

router.post("/signup", authController.signUp);
router.post(
  "/signin",
  authController.signIn
);
// router.get("/verify/:id", authController.verifyAccount);
// router.post("/resetpassword", authController.resetPassword);
// router.get("/resetpasswordconfirm/:id", authController.resetPasswordConfirm);
module.exports = router;
