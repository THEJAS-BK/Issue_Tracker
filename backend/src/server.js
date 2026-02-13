const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
// Routes
const authRoutes = require("./routes/auth");

//Middlewares
const { authorizationToken } = require("./middlewares/auth.middleware");

//setups
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5500",
    credentials: true,
  }),
);
//Mongo connection
main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}
//Schemas
const CreateGroup = require("./models/group");
const ExpressError = require("./utils/ExpressError");
const Issue = require("./models/issue");
//uitls
const { getUniqueInviteCode } = require("./utils/inviteCode");
const group = require("./models/group");
const { findByIdAndUpdate } = require("./models/user");

//! Routes
app.get("/", (req, res) => {
  res.json({ name: "Backend guy", message: "Hello from me the backend guy" });
});
//? Auth section
app.use("/auth", authRoutes);
//! create groups
app.post("/creategroup", authorizationToken, async (req, res, next) => {
  try {
    const {
      groupname,
      description,
      category,
      visibility,
      joinapproval,
      imageuploadpermission,
    } = req.body;
    const inviteCode = await getUniqueInviteCode();
    const newGroup = new CreateGroup({
      groupname,
      description,
      category,
      visibility,
      joinType: joinapproval,
      imageuploadpermission,
      inviteCode,
      createdBy: req.user.userId,
      members: [{ userId: req.user.userId, role: "admin" }],
    });
    await newGroup.save();
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});
//!user pages
app.get("/groups", authorizationToken, async (req, res) => {
  try {
    const allGroups = await CreateGroup.find({
      members: { $elemMatch: { userId: req.user.userId } },
    }).select("groupname description inviteCode");
    const issues = await Issue.find({
      group: { $in: allGroups.map((g) => g._id) },
    });
    res.json({ allGroups, issues });
  } catch (err) {
    res.status(500);
  }
});
app.post("/groups/search", authorizationToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (q.length == 6) {
      const allGroups = await CreateGroup.findOne({ inviteCode: q })
        .select("groupname visibility joinType")
        .populate("createdBy", "name");

      if (allGroups) {
        return res.json({ allGroups: [allGroups] });
      }
    }
    const allGroups = await CreateGroup.find({
      groupname: { $regex: q, $options: "i" },
    })
      .select("groupname visibility joinType")
      .populate("createdBy", "name");
    res.json({ allGroups });
  } catch (err) {
    res.status(500);
  }
});
//joined groups
app.post("/searchjoined", authorizationToken, async (req, res) => {
  try {
    const { val } = req.body;
    if (val.length == 6) {
      const allGroups = await CreateGroup.findOne({ inviteCode: val });
      if (allGroups) {
        return res.json({ allGroups });
      }
    }

    const allGroups = await CreateGroup.find({
      groupname: { $regex: val, $options: "i" },
    });
    res.json({ allGroups });
  } catch (err) {
    res.status(500);
  }
});
//!add pages
app.post("/add/:groupId", authorizationToken, async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { title, description, category } = req.body;
    const newIssue = new Issue({
      title,
      description,
      category,
      group: groupId,
      createdBy: req.user.userId,
    });
    await newIssue.save();

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});
//group interface
app.get(
  "/groupinterface/:groupId",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const issues = await Issue.find({ group: groupId })
        .select("title createdBy createdAt status")
        .populate("createdBy", "name");
        //send cur user
      const curUser = req.user.userId;
      //send all member
      const allmembers = await CreateGroup.findById(groupId)
        .select("members")
        .populate("members");
        //get invite code and group name
        const groupDetails = await CreateGroup.findOne({_id:groupId})
        .select("groupname description inviteCode")
      res.json({ issues, allmembers, curUser, groupDetails });
    } catch (err) {
      next(err);
    }
  },
);
// each card of group interface
app.get("/indissue/:issueid", authorizationToken, async (req, res, next) => {
  try {
    const { issueid } = req.params;
    const issue = await Issue.findById(issueid)
      .select("title description createdBy createdAt status")
      .populate("createdBy", "name");
    res.json({ issue });
  } catch (err) {
    next(err);
  }
});
//search issues in group interface
app.get("/issue/search",authorizationToken, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.sendStatus(404);
    }
    const issues = await Issue.find({
      title: { $regex: q, $options: "i" },
    })
      .select("title createdBy createdAt")
      .populate("createdBy", "name");
    res.json({ issues });
  } catch (err) {
    next(err);
  }
});
//filter satus route
app.get("/filter/:groupId",authorizationToken,async(req,res,next)=>{
  try{
    const {state} = req.query;
    const {groupId} = req.params;
    if(state==="all"){
      const issues = await Issue.find({group:groupId})
     .select("title createdBy createdAt status")
      .populate("createdBy", "name");
      return res.json({issues})
    }
    const issues = await Issue.find({group:groupId,status:state})
     .select("title createdBy createdAt status")
      .populate("createdBy", "name");
     res.json({issues})

  }catch(err){
    next(err);
  }
})
//add new user to group
app.get("/addmember/:groupid", authorizationToken, async (req, res, next) => {
  try {
    const { groupid } = req.params;
    const checkIfExist = await CreateGroup.findOne({
      _id: groupid,
      members: { $elemMatch: { userId: req.user.userId } },
    });
    if (checkIfExist) {
      return res.sendStatus(409);
    }

    await CreateGroup.findByIdAndUpdate(
      groupid,
      { $addToSet: { members: { userId: req.user.userId, role: "member" } } },
      {
        new: true,
        runValidators: true,
      },
    );
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});
//!!! admin routes
app.get("/api/:groupid/admin", authorizationToken, async (req, res, next) => {
  try {
    const { groupid } = req.params;
    const issues = await Issue.find({ group: groupid })
      .select("title createdBy createdAt status")
      .populate("createdBy", "name");
    res.json({ issues });
  } catch (err) {
    next(err);
  }
});
// update states
app.post("/api/:issueId/update/admin",async(req,res,next)=>{
  try{
    const {issueId}=req.params;
    const {state}=req.body;
    await Issue.findByIdAndUpdate(issueId,
      {
      status:state,
      },
      {
        new:true,
        runValidators:true
      })
      res.sendStatus(200)
  }
  catch(err){
    next(err)
  }
})

//404 route
app.all("/*splat", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});
//error middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).json({ message });
});

//server start
app.listen(8080, () => {
  console.log("server started at port 8080");
});
