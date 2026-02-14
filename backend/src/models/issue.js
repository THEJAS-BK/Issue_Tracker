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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "inprogress", "resolved"],
    default: "pending",
  },
  
});
module.exports = mongoose.model("Issue", issueSchema);
