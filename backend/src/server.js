const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
// Routes
const authRoutes = require("./routes/auth.routes");
const groupRoutes=require("./routes/group.routes")

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


//! Routes
app.get("/", (req, res) => {
  res.json({ name: "Backend guy", message: "Hello from me the backend guy" });
});
//? Auth section
app.use("/auth", authRoutes);
//! create groups
app.use("/groups",groupRoutes)

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
    if (!issueid) return res.sendStatus(400);

    const curUser = req.user.userId;
    if (!curUser) return res.sendStatus(401);

    isIssueOwner = false;
    const getIssue = await Issue.findOne({ _id: issueid, createdBy: curUser });
    if (getIssue) {
      isIssueOwner = true;
    }

    //check anonymous
    const checkAnonymous =
      await Issue.findById(issueid).select("stayAnonymous");
    if (checkAnonymous.stayAnonymous) {
      const issue = await Issue.findById(issueid).select(
        "title description createdAt status",
      );
      return res.json({ issue, isIssueOwner });
    }

    const issue = await Issue.findById(issueid)
      .select("title description createdAt createdBy status")
      .populate("createdBy", "name");
    res.json({ issue, isIssueOwner });
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
//?group interface search route
app.get(
  "/api/members/search/:groupId/user",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId } = req.params;
      if (!groupId) return res.sendStatus(400);

      const val = req.query.q;
      if (!val) return res.sendStatus(400);

      const allmembers = await CreateGroup.findById(groupId)
        .select("members")
        .populate("members.userId", "name");

      const regex = new RegExp(val, "i");
      const members = allmembers.members.filter((mem) => {
        return regex.test(mem.userId.name);
      });
      res.json({ members });
    } catch (err) {
      next(err);
    }
  },
);
app.get(
  "/api/members/:groupId/user",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId } = req.params;
      if (!groupId) return res.sendStatus(400);

      const members = await CreateGroup.findById(groupId)
        .select("members")
        .populate("members.userId", "name");
      res.json({ members });
    } catch (err) {
      next(err);
    }
  },
);
//?send request to join group
app.post(
  "/api/group/join/request/:groupId",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId } = req.params;
      if (!groupId) return res.sendStatus(400);

      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      if (!mongoose.Types.ObjectId.isValid(groupId)) return res.sendStatus(404);

      const group = await CreateGroup.findById(groupId);
      if (!group) return res.sendStatus(404);

      const isMember = group.members.some(
        (member) => member.userId.toString() === curUser,
      );
      if (isMember)
        return res
          .status(409)
          .json({ code: "already_member", message: "Already a member" });

      const isRequested = group.joinRequests.some(
        (request) => request.userId.toString() === curUser,
      );
      if (isRequested)
        return res
          .status(409)
          .json({ code: "already_requested", message: "Already requested" });

      await CreateGroup.findByIdAndUpdate(groupId, {
        $push: {
          joinRequests: { userId: curUser },
        },
      });
      res.sendStatus(201);
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
        "groupname description joinType imageuploadpermission",
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

      const { groupname, description, joinapproval, imageuploadpermission } =
        req.body;
      await CreateGroup.findByIdAndUpdate(groupId, {
        groupname,
        description,
        joinType: joinapproval,
        imageuploadpermission,
      });
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  },
);
//!send group members
app.get(
  "/api/members/:groupId/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId } = req.params;
      if (!groupId) return res.sendStatus(400);

      const curUser = req.user.userId;
      if (!curUser) res.sendStatus(401);

      if (!mongoose.Types.ObjectId.isValid(groupId)) return res.sendStatus(404);

      const members = await CreateGroup.findById(groupId)
        .select("members")
        .populate("members.userId", "name email");

      const curUserRole = members.members.find(
        (mem) => mem.userId._id.toString() === curUser,
      ).role;

      res.json({ members, curUserRole });
    } catch (err) {
      next(err);
    }
  },
);
//search group members
app.get(
  "/api/members/search/:groupId/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId } = req.params;
      if (!groupId) return res.sendStatus(400);

      const searchText = req.query.q;
      if (!searchText) return res.sendStatus(400);

      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      if (!mongoose.Types.ObjectId.isValid(groupId)) return res.sendStatus(404);

      const allmembers = await CreateGroup.findById(groupId)
        .select("members")
        .populate("members.userId", "name email");

      const regex = new RegExp(searchText, "i");

      const members = allmembers.members.filter((mem) => {
        return regex.test(mem.userId.name);
      });

      const curUserRole = allmembers.members.find(
        (mem) => mem.userId._id.toString() === curUser,
      ).role;

      res.json({ members, curUserRole });
    } catch (err) {
      next(err);
    }
  },
);
//!promotion and demotion
app.put(
  "/api/members/promote/:groupId/:userId/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId, userId } = req.params;
      if (!groupId || !userId) return res.sendStatus(400);

      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      if (!mongoose.Types.ObjectId.isValid(groupId)) return res.sendStatus(404);

      const group = await CreateGroup.findById(groupId);
      if (group.createdBy.toString() !== curUser) return res.sendStatus(403);

      const val = await CreateGroup.updateOne(
        {
          _id: groupId,
          "members.userId": userId,
        },
        {
          $set: {
            "members.$.role": "coadmin",
          },
        },
      );
      res.sendStatus(201);
    } catch (err) {
      next(err);
    }
  },
);
//!demote
app.put(
  "/api/members/demote/:groupId/:userId/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId, userId } = req.params;
      if (!groupId || !userId) return res.sendStatus(400);

      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      if (!mongoose.Types.ObjectId.isValid(groupId)) return res.sendStatus(404);

      const group = await CreateGroup.findById(groupId);
      if (group.createdBy.toString() !== curUser) return res.sendStatus(403);

      await CreateGroup.updateOne(
        {
          _id: groupId,
          "members.userId": userId,
        },
        {
          $set: {
            "members.$.role": "member",
          },
        },
      );

      res.sendStatus(201);
    } catch (err) {
      next(err);
    }
  },
);
//!kick member
app.delete(
  "/api/members/kick/:groupId/:userId/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId, userId } = req.params;
      if (!groupId || !userId) return res.sendStatus(400);

      if (!mongoose.Types.ObjectId.isValid(groupId)) return res.sendStatus(404);
      await CreateGroup.updateOne(
        {
          _id: groupId,
        },
        {
          $pull: {
            members: { userId: userId },
          },
        },
      );
      //delete all the issues by the user in group
      await Issue.deleteMany({ group: groupId, createdBy: userId });

      res.sendStatus(201);
    } catch (err) {
      next(err);
    }
  },
);
//!get search results initailly
app.get(
  "/api/group/join/request/:groupId/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId } = req.params;
      if (!groupId) return res.sendStatus(400);

      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      const allmembers = await CreateGroup.findById(groupId).select("members");

      const curUserRole = allmembers.members.find((mem) => {
        return mem.userId.toString() === curUser;
      }).role;

      if (!curUserRole || curUserRole === "member") return res.sendStatus(403);

      const requests = await CreateGroup.findById(groupId)
        .select("joinRequests")
        .populate("joinRequests.userId", "name");

      res.json(requests);
    } catch (err) {
      next(err);
    }
  },
);
//!join request accept code
app.post(
  "/api/group/join/request/:userId/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const groupId = req.query.q;
      if (!groupId || !userId) return res.sendStatus(400);

      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      const allmembers = await CreateGroup.findById(groupId).select("members");

      const curUserRole = allmembers.members.find((mem) => {
        return mem.userId.toString() === curUser;
      }).role;

      if (curUserRole !== "admin" && curUserRole !== "coadmin")
        return res.status(403).json({ message: "unauthorized" });

      await CreateGroup.updateOne(
        {
          _id: groupId,
        },
        {
          $pull: {
            joinRequests: { userId: userId },
          },
        },
      );
      await CreateGroup.updateOne(
        {
          _id: groupId,
        },
        {
          $push: {
            members: { userId: userId, role: "member" },
          },
        },
      );
      res.sendStatus(201);
    } catch (err) {
      next(err);
    }
  },
);
//!decline join requests
app.post(
  "/api/group/join/request/:userId/admin/decline",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const groupId = req.query.q;
      if (!groupId || !userId) return res.sendStatus(400);

      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      const allmembers = await CreateGroup.findById(groupId).select("members");

      const curUserRole = allmembers.members.find((mem) => {
        return mem.userId.toString() === curUser;
      }).role;

      if (curUserRole !== "admin" && curUserRole !== "coadmin")
        return res.status(403).json({ message: "unauthorized" });

      await CreateGroup.updateOne(
        {
          _id: groupId,
        },
        {
          $pull: {
            joinRequests: { userId: userId },
          },
        },
      );
      res.sendStatus(201);
    } catch (err) {
      next(err);
    }
  },
);
//!search join request
app.get(
  "/api/group/join/request/:groupId/admin/search",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const val = req.query.q;
      if (!groupId || !val) return res.sendStatus(400);

      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      const allmembers = await CreateGroup.findById(groupId).select("members");

      const curUserRole = allmembers.members.find((mem) => {
        return mem.userId.toString() === curUser;
      }).role;

      if (curUserRole !== "admin" && curUserRole !== "coadmin")
        return res.status(403).json({ message: "unauthorized" });

      const requests = await CreateGroup.findById(groupId)
        .select("joinRequests")
        .populate("joinRequests.userId", "name");

      const regex = new RegExp(val, "i");
      const members = requests.joinRequests.filter((mem) => {
        return regex.test(mem.userId.name);
      });

      res.json(members);
    } catch (err) {
      next(err);
    }
  },
);
//!delete issue by admin privilages
app.delete(
  "/api/:issueId/delete/admin",
  authorizationToken,
  async (req, res, next) => {
    try {
      const { issueId } = req.params;
      const groupId = req.query.q;
      if (!groupId || !issueId) return res.sendStatus(400);

      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      const allmembers = await CreateGroup.findById(groupId).select("members");

      const curUserRole = allmembers.members.find((mem) => {
        return mem.userId.toString() === curUser;
      }).role;

      if (curUserRole !== "admin" && curUserRole !== "coadmin")
        return res.status(403).json({ message: "unauthorized" });

      await Issue.deleteOne({
        _id: issueId,
        group: groupId,
      });
      res.sendStatus(201);
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
  const statusCode = err.statusCode || 500;
  const message =
    err.message || "Something went wrong";

  // log unexpected errors
  if (!err.isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message
  });
});


//server start
app.listen(8080, () => {
  console.log("server started at port 8080");
});
