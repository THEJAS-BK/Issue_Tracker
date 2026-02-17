const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
// Routes
const authRoutes = require("./routes/auth.routes");
const groupRoutes=require("./routes/group.routes");
const issueRoutes = require("./routes/issue.routes")

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
const Group = require("./models/group");
const ExpressError = require("./utils/ExpressError");
const Issue = require("./models/issue");
//uitls


//! Routes
app.get("/", (req, res) => {
  res.json({ name: "Backend guy", message: "Hello from me the backend guy" });
});
//? Auth section
app.use("/auth", authRoutes);
//? groups
app.use("/groups",groupRoutes);
//?issues
app.use("/issues",issueRoutes);
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

    const groupDetails = await Group.findById(groupid).select(
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

      const group = await Group.findById(groupId);
      if (group.createdBy.toString() !== curUser) return res.sendStatus(403);

      await Group.findOneAndDelete({ _id: groupId });
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

      const groupInfo = await Group.findById(groupId).select(
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

      const group = await Group.findById(groupId);
      if (group.createdBy.toString() !== curUser) return res.sendStatus(403);

      const { groupname, description, joinapproval, imageuploadpermission } =
        req.body;
      await Group.findByIdAndUpdate(groupId, {
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

      const members = await Group.findById(groupId)
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

      const allmembers = await Group.findById(groupId)
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

      const group = await Group.findById(groupId);
      if (group.createdBy.toString() !== curUser) return res.sendStatus(403);

      const val = await Group.updateOne(
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

      const group = await Group.findById(groupId);
      if (group.createdBy.toString() !== curUser) return res.sendStatus(403);

      await Group.updateOne(
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
      await Group.updateOne(
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

      const allmembers = await Group.findById(groupId).select("members");

      const curUserRole = allmembers.members.find((mem) => {
        return mem.userId.toString() === curUser;
      }).role;

      if (!curUserRole || curUserRole === "member") return res.sendStatus(403);

      const requests = await Group.findById(groupId)
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

      const allmembers = await Group.findById(groupId).select("members");

      const curUserRole = allmembers.members.find((mem) => {
        return mem.userId.toString() === curUser;
      }).role;

      if (curUserRole !== "admin" && curUserRole !== "coadmin")
        return res.status(403).json({ message: "unauthorized" });

      await Group.updateOne(
        {
          _id: groupId,
        },
        {
          $pull: {
            joinRequests: { userId: userId },
          },
        },
      );
      await Group.updateOne(
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

      const allmembers = await Group.findById(groupId).select("members");

      const curUserRole = allmembers.members.find((mem) => {
        return mem.userId.toString() === curUser;
      }).role;

      if (curUserRole !== "admin" && curUserRole !== "coadmin")
        return res.status(403).json({ message: "unauthorized" });

      await Group.updateOne(
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

      const allmembers = await Group.findById(groupId).select("members");

      const curUserRole = allmembers.members.find((mem) => {
        return mem.userId.toString() === curUser;
      }).role;

      if (curUserRole !== "admin" && curUserRole !== "coadmin")
        return res.status(403).json({ message: "unauthorized" });

      const requests = await Group.findById(groupId)
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

      const allmembers = await Group.findById(groupId).select("members");

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
