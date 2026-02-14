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
      visibility,
      joinapproval,
      imageuploadpermission,
    } = req.body;
    const inviteCode = await getUniqueInviteCode();
    const newGroup = new CreateGroup({
      groupname,
      description,

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
    const { title, description, stayAnonymous } = req.body;
    const newIssue = new Issue({
      title,
      description,
      stayAnonymous,
      group: groupId,
      createdBy: req.user.userId,
    });
    await newIssue.save();

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});
//edit issues
app.get("/edit/:issueId", authorizationToken, async (req, res, next) => {
  try {
    const { issueId } = req.params;
    if (!issueId) return res.sendStatus(400);

    const issue = await Issue.findById(issueId).select(
      "title description stayAnonymous",
    );
    res.json({ issue });
  } catch (err) {
    next(err);
  }
});
//confirm changes
app.patch("/edit/:issueId", authorizationToken, async (req, res, next) => {
  try {
    const { issueId } = req.params;
    if (!issueId) return res.sendStatus(400);

    const curUser = req.user.userId;
    if (!curUser) return res.sendStatus(401);

    const checkIssue = await Issue.findById(issueId).select("createdBy");

    if (!mongoose.Types.ObjectId.isValid(issueId)) return res.sendStatus(404);

    if (checkIssue.createdBy.toString() !== curUser) return res.sendStatus(403);

    const { title, description, stayAnonymous } = req.body;
    await Issue.findByIdAndUpdate(issueId, {
      title,
      description,
      stayAnonymous,
    });
    res.sendStatus(204);
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
        .select("title createdBy createdAt status stayAnonymous")
        .populate("createdBy", "name");
      //send cur user
      const curUser = req.user.userId;
      //send all member
      const allmembers = await CreateGroup.findById(groupId)
        .select("members")
        .populate("members");
      //get invite code and group name
      const groupDetails = await CreateGroup.findOne({ _id: groupId }).select(
        "groupname description inviteCode",
      );
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
    //check anonymous
    const checkAnonymous =
      await Issue.findById(issueid).select("stayAnonymous");
    if (checkAnonymous.stayAnonymous) {
      const issue = await Issue.findById(issueid).select(
        "title description createdAt status",
      );
      return res.json({ issue });
    }

    const issue = await Issue.findById(issueid)
      .select("title description createdAt createdBy status")
      .populate("createdBy", "name");
    res.json({ issue });
  } catch (err) {
    next(err);
  }
});
//search issues in group interface
app.get("/issue/search", authorizationToken, async (req, res, next) => {
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
app.get("/filter/:groupId", authorizationToken, async (req, res, next) => {
  try {
    const { state } = req.query;
    const { groupId } = req.params;
    if (state === "all") {
      const issues = await Issue.find({ group: groupId })
        .select("title createdBy createdAt status")
        .populate("createdBy", "name");
      return res.json({ issues });
    }
    const issues = await Issue.find({ group: groupId, status: state })
      .select("title createdBy createdAt status")
      .populate("createdBy", "name");
    res.json({ issues });
  } catch (err) {
    next(err);
  }
});
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
//delete issues by owner
app.delete(
  "/delete/issue/:issueId",
  authorizationToken,
  async (req, res, next) => {
    try {
      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      const { issueId } = req.params;
      if (!issueId) return res.sendStatus(400);

      //check if id is valid or not
      if (!mongoose.Types.ObjectId.isValid(issueId)) return res.sendStatus(404);

      const issue = await Issue.findById(issueId);
      if (!issue) return res.sendStatus(404);

      //check validations
      if (issue.createdBy.toString() !== req.user.userId)
        return res.sendStatus(403);

      await Issue.findByIdAndDelete(issueId);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
);
//!!! admin routes
//send issues
app.get(
  "/api/indissue/:issueid/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { issueid } = req.params;
      if (!issueid) return res.sendStatus(400);

      if (!mongoose.Types.ObjectId.isValid(issueid)) return res.sendStatus(404);

      const issue = await Issue.findById(issueid)
        .select("title description createdAt createdBy status")
        .populate("createdBy", "name");
      res.json({ issue });
    } catch (err) {
      next(err);
    }
  },
);
app.get("/api/:groupid/admin", authorizationToken, async (req, res, next) => {
  try {
    const { groupid } = req.params;
    if (!groupid) return res.sendStatus(400);

    const issues = await Issue.find({ group: groupid })
      .select("title createdBy createdAt status")
      .populate("createdBy", "name");

    const groupDetails = await CreateGroup.findById(groupid).select(
      "groupname description inviteCode",
    );
    res.json({ issues, groupDetails });
  } catch (err) {
    next(err);
  }
});
// update states
app.post(
  "/api/:issueId/update/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const { state } = req.body;
      await Issue.findByIdAndUpdate(
        issueId,
        {
          status: state,
        },
        {
          new: true,
          runValidators: true,
        },
      );
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  },
);
//! delete group
app.delete(
  "/api/delete/:groupId/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      const { groupId } = req.params;
      if (!groupId) return res.sendStatus(400);

      if (!mongoose.Types.ObjectId.isValid(groupId)) return res.sendStatus(404);

      const group = await CreateGroup.findById(groupId);
      if (group.createdBy.toString() !== curUser) return res.sendStatus(403);

      await CreateGroup.findOneAndDelete({ _id: groupId });
      res.sendStatus(201);
    } catch (err) {
      next(err);
    }
  },
);
//!edit group page
app.get(
  "/api/edit/group/:groupId/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId } = req.params;
      if (!groupId) return res.sendStatus(400);
      if (!mongoose.Types.ObjectId.isValid(groupId)) return res.sendStatus(404);

      const groupInfo = await CreateGroup.findById(groupId).select(
        "groupname description visibility joinType imageuploadpermission",
      );
      res.json({ groupInfo });
    } catch (err) {
      next(err);
    }
  },
);
//update group
app.patch(
  "/api/update/group/:groupId/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      const { groupId } = req.params;
      if (!groupId) return res.sendStatus(400);

      if (!mongoose.Types.ObjectId.isValid(groupId)) return res.sendStatus(404);

      const group = await CreateGroup.findById(groupId);
      if (group.createdBy.toString() !== curUser) return res.sendStatus(403);

      const {
        groupname,
        description,
        visibility,
        joinapproval,
        imageuploadpermission,
      } = req.body;
      await CreateGroup.findByIdAndUpdate(groupId, {
        groupname,
        description,
        visibility,
        joinType: joinapproval,
        imageuploadpermission,
      });
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
);

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
