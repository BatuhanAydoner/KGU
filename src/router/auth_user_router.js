const express = require("express");
const router = express.Router();
const authUserController = require("../controller/auth_user_controller");
const validationMiddleware = require("../middleware/validation_middleware");

router.post(
  "/signup",
  validationMiddleware.validateNewUser(),
  authUserController.signup
);

router.post(
  "/signin",
  validationMiddleware.validateLoginUser(),
  authUserController.signin
);

module.exports = router;
