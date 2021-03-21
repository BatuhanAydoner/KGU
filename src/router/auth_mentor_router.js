const express = require("express");
const router = express.Router();
const authMentorController = require("../controller/auth_mentor_controller");
const validationMiddleware = require("../middleware/validation_middleware");

router.post(
  "/signup",
  validationMiddleware.validateNewUser(),
  authMentorController.signup
);

router.post(
  "/signin",
  validationMiddleware.validateLoginUser(),
  authMentorController.signin
);

module.exports = router;
