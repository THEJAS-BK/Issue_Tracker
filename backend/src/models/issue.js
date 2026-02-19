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
    default: Date.now,
  },


  updatedAt: {
    type: Date,
  },

  editedAt: {
    type: Date,
  },

  markInprogress: {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    at: Date,
  },

  resolved: {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    at: Date,
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },

  deleted: {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      enum: ["admin", "coadmin", "member"],
    },
    reason: String,
    at: Date,
  },
});

module.exports = mongoose.model("Issue", issueSchema);
