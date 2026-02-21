const mongoose = require("mongoose");

//?schemas
const Group = require("../models/group");
const ExpressError = require("../utils/ExpressError");
const Issue = require("../models/issue");

const User = require("../models/user");
//!add issue to the group
module.exports.addIssue = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { title, description, stayAnonymous } = req.body;
    const newIssue = new Issue({
      title,
      description,
      stayAnonymous,
      group: groupId,
      createdBy: req.user.userId,
      image: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
    await newIssue.save();

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};
//!get edit issue page
module.exports.getEditIssuePage = async (req, res, next) => {
  try {
    const { issueId } = req.params;
    if (!issueId) return res.sendStatus(400);

    const issue = await Issue.findById(issueId).select(
      "title description stayAnonymous image",
    );
    res.json({ issue });
  } catch (err) {
    next(err);
  }
};
//!confirm edited issue change
module.exports.confirmEditIssue = async (req, res, next) => {
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
      image: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
//! search issues in group user interface
module.exports.searchIssueInGroupUserInterface = async (req, res, next) => {
  try {
    const { q, groupId } = req.query;

    if (!q) {
      return res.sendStatus(404);
    }
    const issues = await Issue.find({
      title: { $regex: q, $options: "i" },
      group: groupId,
      isDeleted: false,
    })
      .select("title createdBy createdAt status")
      .populate("createdBy", "name");
    res.json({ issues });
  } catch (err) {
    next(err);
  }
};
//! get complete details about an issue and render it on the right side
module.exports.getIssueDetailsUserInterface = async (req, res, next) => {
  try {
    const { issueid } = req.params;
    if (!issueid) return res.sendStatus(400);

    const curUser = req.user.userId;
    if (!curUser) return res.sendStatus(401);

    isIssueOwner = false;
    const getIssue = await Issue.findOne({
      _id: issueid,
      createdBy: curUser,
      isDeleted: false,
    });
    if (getIssue) {
      isIssueOwner = true;
    }

    //check anonymous
    const checkAnonymous =
      await Issue.findById(issueid).select("stayAnonymous");
    if (checkAnonymous.stayAnonymous) {
      const issue = await Issue.findById(issueid).select(
        "title description createdAt status image",
      );
      return res.json({ issue, isIssueOwner });
    }

    const issue = await Issue.findById(issueid)
      .select("title description createdAt createdBy status image")
      .populate("createdBy", "name");
    res.json({ issue, isIssueOwner });
  } catch (err) {
    next(err);
  }
};
//! filter groups acc to pending,all,resolved,inprogress
module.exports.filterIssuesInGroupUserInterface = async (req, res, next) => {
  try {
    const { state } = req.query;
    const { groupId } = req.params;

    if (!state || !groupId) return res.sendStatus(400);

    if (!req.user.userId) return res.sendStatus(403);

     const allIssuesForStates = await Issue.find({
      group: groupId,
      isDeleted: false,
    });

    const states = {
      total: allIssuesForStates.length,
      pending: allIssuesForStates.filter((issue) => issue.status === "pending")
        .length,
      inprogress: allIssuesForStates.filter(
        (issue) => issue.status === "inprogress",
      ).length,
      resolved: allIssuesForStates.filter(
        (issue) => issue.status === "resolved",
      ).length,
    };

    if (state === "all") {
      const issues = await Issue.find({ group: groupId, isDeleted: false })
        .select("title createdBy createdAt status ")
        .populate("createdBy", "name");
      return res.json({ issues, states });
    }
    if (state === "myIssues") {
      const issues = await Issue.find({
        group: groupId,
        createdBy: req.user.userId,
        isDeleted: false,
      })
        .select("title createdBy createdAt status")
        .populate("createdBy", "name");
      return res.json({ issues, states });
    }

    const issues = await Issue.find({
      group: groupId,
      status: state,
      isDeleted: false,
    })
      .select("title createdBy createdAt status")
      .populate("createdBy", "name");

   

    res.json({ issues, states });
  } catch (err) {
    next(err);
  }
};
//!delete issue by owner in user interface
module.exports.deleteIssueByOwner = async (req, res, next) => {
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

    issue.isDeleted = true;

    issue.deleted = {
      by: curUser,
      role: "member",
      reason: "User deleted",
      at: new Date(),
    };
    await issue.save();

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
/*

! admin page issues code

*/

//?get the admin dashboard page
module.exports.getIssuesInAdminPage = async (req, res, next) => {
  try {
    const { issueid } = req.params;
    if (!issueid) return res.sendStatus(400);

    if (!mongoose.Types.ObjectId.isValid(issueid)) return res.sendStatus(404);

    const issue = await Issue.find({ _id: issueid, isDeleted: false })
      .select("title description createdAt createdBy status image")
      .populate("createdBy", "name");
    res.json({ issue });
  } catch (err) {
    next(err);
  }
};

//? mark as read and progress updation
module.exports.markIssueAsReadInAdminPage = async (req, res, next) => {
  try {
    const { issueId } = req.params;
    const { state } = req.body;

    if (!state || !issueId) return res.sendStatus(400);

    const curUser = req.user.userId;

    if (state === "inprogress") {
      await Issue.updateOne(
        {
          _id: issueId,
        },
        {
          $set: {
            status: "inprogress",
            markInprogress: {
              by: curUser,
              at: new Date(),
            },
          },
        },
      );
    }

    if (state === "resolved") {
      const issue = await Issue.findById(issueId);

      if (state === "resolved" && issue.status !== "inprogress") {
        throw new ExpressError(
          "Issue must be in progress before resolving",
          400,
        );
      }

      await Issue.updateOne(
        {
          _id: issueId,
        },
        {
          $set: {
            status: "resolved",
            resolved: {
              by: curUser,
              at: new Date(),
            },
          },
        },
      );
    }
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

//? delete issues by admin privilages
module.exports.deleteIssueByAdmin = async (req, res, next) => {
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

    const issue = await Issue.findById(issueId);
    if (!issue) return res.sendStatus(404);

    issue.isDeleted = true;
    issue.deleted = {
      by: curUser,
      role: curUserRole,
      reason: "Admin deleted",
      at: new Date(),
    };
    await issue.save();

    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
};
//!get user history data
module.exports.getHistoryTabData = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.sendStatus(400);

    const groupId = req.query.groupId;
    if (!groupId) return res.sendStatus(400);

    const historyData = await Issue.find({
      createdBy: userId,
      group: groupId,
    })
      .select(
        "title createdAt status markInprogress resolved isDeleted deleted",
      )
      .populate("createdBy", "name")
      .populate("deleted.by", "name")
      .populate("markInprogress.by", "name")
      .populate("resolved.by", "name");

    const totalIssueRaised = await Issue.countDocuments({
      group: groupId,
      createdBy: {
        _id: userId,
      },
    });

    const totalIssueResolved = await Issue.countDocuments({
      group: groupId,
      status: "resolved",
      createdBy: {
        _id: userId,
      },
    });
    const totalIssuesInProgress = await Issue.countDocuments({
      group: groupId,
      status: "inprogress",
      createdBy: {
        _id: userId,
      },
    });
    const totalIssuesDeletedByUser = await Issue.countDocuments({
      group: groupId,
      isDeleted: true,
      createdBy: {
        _id: userId,
      },
    });
    const totalIssueDeletedByAdmin = await Issue.countDocuments({
      createdBy: userId,
      group: groupId,
      isDeleted: true,
      "deleted.role": { $in: ["admin", "coadmin"] },
    });
    const allDetails = await Group.findById(groupId).select("members");

    const curUserDetails = allDetails.members.find((mem) => {
      return mem.userId.toString() === userId;
    });
    const userName = await User.findById(userId).select("name");

    const history = {
      historyData,
      totalIssueRaised,
      totalIssueResolved,
      totalIssuesInProgress,
      totalIssuesDeletedByUser,
      totalIssueDeletedByAdmin,
      curUserDetails,
      userName,
    };
    //history of each issue
    res.json(history);
  } catch (err) {
    next(err);
  }
};
