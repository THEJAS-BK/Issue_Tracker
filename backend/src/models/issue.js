const mongoose = require("mongoose");

const issueSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  stayAnonymous: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: "",
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "inprogress", "resolved"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  markInprogress:{
    by:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    at:{
      type:Date
    }
  },
    resolved: {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    at: Date,
  },
  
});
module.exports = mongoose.model("Issue", issueSchema);
