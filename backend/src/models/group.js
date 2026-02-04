const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  groupname: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default:"",
  },
  category: {
    type: String,
    enum:["Select category","Bus Issues","Hostel Issues","Campus Issues","Academic Issues","Other Issues"],
    required: true,
  },
  visibility: {
    type: String,
    enum:["public","private"],
    default:"public",
  },
  joinapproval: {
    type: String,
    default:"notrequired",
  },
  imageuploadpermission: {
    type:String,
    required:false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt:{
    type: Date,
    default: Date.now,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
});
module.exports = mongoose.model("Group", GroupSchema);
