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
    res.status(404).json({ message: "Successfull" });
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

const allMentors = async (req, res, next) => {
  try {
    const all = await Mentor.find(
      {},
      { id: 1, firstname: 1, lastname: 1, email: 1 }
    );
    res.json({ mentors: all });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
  allMentors,
};
