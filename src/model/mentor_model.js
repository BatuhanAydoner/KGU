const mongoose = require("mongoose");

const CoursesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
  },
});

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
      minlenght: [1, "Firstname cannot be null or empty."],
      maxlength: [30, "Firstname cannot be bigger than 30 characters."],
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      minlenght: [1, "Lastname cannot be null or empty."],
      maxlength: [30, "Lastname cannot be bigger than 30 characters."],
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    emailActive: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    courses: [CoursesSchema],
    total_income: {
      type: Number,
      default: 0,
    },
    photo_path: {
      type: String,
      default: "",
    },
    mentor_about: {
      type: String,
      default: "",
    },
    hour_price: {
      type: String,
      default: "",
    },
  },
  { collection: "Mentors", timestamps: true }
);

const User = mongoose.model("Mentor", UserSchema);

module.exports = User;
