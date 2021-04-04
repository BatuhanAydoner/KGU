const { validationResult } = require("express-validator");
const User = require("../model/user_model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HttpError = require("../error/HttpError");
const nodemailer = require("nodemailer");
const ObjectId = require("mongodb").ObjectId;

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
    const _user = await User.findOne({ email: req.body.email });

    if (_user) {
      const httpError = new HttpError(
        "Use exists already, please login instead.",
        500
      );
      return next(httpError);
    }

    const newUser = new User({
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
  const _user = await User.findOne({ email: req.body.email });

  if (!_user) {
    const noUserError = new HttpError("Email/password is invalid.");
    return next(noUserError);
  }

  const comparedPass = await bcrypt.compare(req.body.password, _user.password);
  if (!comparedPass) {
    const noUserError = new HttpError("Email/password is invalid.");
    return next(noUserError);
  }

  const jwtInfo = {
    id: _user.id,
    firstname: _user.firstname,
    lastname: _user.lastname,
    email: _user.email,
  };

  const jwtToken = jwt.sign(jwtInfo, "kgu_jwt_token", { expiresIn: 86400 });

  res.status(201).json({ message: "Successful", token: jwtToken });
};

const getUser = async (req, res, next) => {
  const id = req.params.id;
  const _user = await User.findById(id, { password: 0 });

  if (!_user) {
    const noUserError = new HttpError("User could not be found", 404);
    return next(noUserError);
  }

  res.status(201).json({ user: _user });
};

const updateUser = async (req, res, next) => {
  const user_id = ObjectId(req.params.id);
  let foundedUser = null;

  const update = { ...req.body };

  try {
    const _user = await User.findById({ _id: user_id });
    if (_user) {
      foundedUser = _user;
    } else {
      return next("Mentor could not be found", 500);
    }
  } catch (error) {
    next(error);
  }

  try {
    const user = await User.findByIdAndUpdate(
      { _id: user_id },
      {
        ...update,
      }
    );
    res.status(201).json({ message: "Updated" });
  } catch (error) {
    next(error);
  }
};

const addCredit = async (req, res, next) => {
  const errorArray = validationResult(req);

  if (!errorArray.isEmpty()) {
    const httpError = new HttpError(errorArray.array()[0].msg, 500);
    return next(httpError);
  }

  const user_id = req.body.id;
  const quantity = parseInt(req.body.quantity);

  try {
    const _user = await User.findById(user_id);

    if (!_user) {
      const noUserError = new HttpError("User could not e found", 500);
      return next(noUserError);
    }

    let current_jeton = _user.current_jeton;
    current_jeton = current_jeton + quantity;

    let total_jeton = _user.total_jeton;
    total_jeton = total_jeton + quantity;

    await _user.updateOne({
      current_jeton: current_jeton,
      total_jeton: total_jeton,
    });

    res.status(201).json({ message: "Uploaded credit." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
  getUser,
  updateUser,
  addCredit,
};
