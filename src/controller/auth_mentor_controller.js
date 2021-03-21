const { validationResult } = require("express-validator");
const Mentor = require("../model/mentor_model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HttpError = require("../error/HttpError");
const nodemailer = require("nodemailer");

const signup = async (req, res, next) => {
  const errorArray = validationResult(req);

  if (!errorArray.isEmpty()) {
    const httpError = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(httpError);
  }
  try {
    const _mentor = await Mentor.findOne({ email: req.body.email });

    if (_mentor) {
      const httpError = new HttpError(
        "Use exists already, please login instead.",
        500
      );
      return next(httpError);
    }

    const newUser = new Mentor({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
    });

    await newUser.save();

    res.status(200).json({ id: newUser.id, email: newUser.email });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  const _mentor = await Mentor.findOne({ email: req.body.email });

  if (!_mentor) {
    const noUserError = new HttpError("Email/password is invalid.");
    return next(noUserError);
  }

  const comparedPass = await bcrypt.compare(
    req.body.password,
    _mentor.password
  );
  if (!comparedPass) {
    const noUserError = new HttpError("Email/password is invalid.");
    return next(noUserError);
  }

  const jwtInfo = {
    id: _mentor.id,
    email: _mentor.email,
  };

  const jwtToken = jwt.sign(jwtInfo, "kgu_jwt_token", { expiresIn: 86400 });

  res.status(201).json({ message: "Successful", token: jwtToken });
};

module.exports = {
  signup,
  signin,
};
