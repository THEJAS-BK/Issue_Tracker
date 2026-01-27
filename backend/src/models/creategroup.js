const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  groupname: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  visibility: {
    type: String,
    required: true,
  },
  joinapproval: {
    type: String,
    required: true,
  },
  imageuploadpermission: {
    type:String,
    required:true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
module.exports = mongoose.model("creategroup", GroupSchema);
