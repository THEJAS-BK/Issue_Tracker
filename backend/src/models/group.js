const mongoose = require("mongoose");
const Issue = require("./issue")
const GroupSchema = new mongoose.Schema({
  groupname: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  joinType: {
    type: String,
    enum: ["open", "request"],
    default: "open",
  },
  imageuploadpermission: {
    type: String,
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
  members: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      role: {
        type: String,
        enum: ["admin", "coadmin", "member"],
        default: "member",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  inviteCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  joinRequests: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      requestedAt:{
        type:Date,
        default:Date.now(),
      }
    },
  ],
});
GroupSchema.post("findOneAndDelete",async(data)=>{
  if(data){
      await Issue.deleteMany({group:data._id})
  }
})

module.exports = mongoose.model("Group", GroupSchema);
