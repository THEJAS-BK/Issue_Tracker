const mongoose = require("mongoose");

//?schemas
const Group = require("../models/group");
const ExpressError = require("../utils/ExpressError");
const Issue = require("../models/issue");
const group = require("../models/group");

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
      "title description stayAnonymous",
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
    });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
//! search issues in group user interface
module.exports.searchIssueInGroupUserInterface = async (req, res, next) => {
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
};
//! get complete details about an issue and render it on the right side
module.exports.getIssueDetailsUserInterface = async (req, res, next) => {
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
};
//! filter groups acc to pending,all,resolved,inprogress
module.exports.filterIssuesInGroupUserInterface = async (req, res, next) => {
  try {
    const { state } = req.query;
    const { groupId } = req.params;

    if (!state || !groupId) return res.sendStatus(400);

    if (!req.user.userId) return res.sendStatus(403);

    if (state === "all") {
      const issues = await Issue.find({ group: groupId })
        .select("title createdBy createdAt status")
        .populate("createdBy", "name");
      return res.json({ issues });
    }
    if (state === "myIssues") {
      const issues = await Issue.find({
        group: groupId,
        createdBy: req.user.userId,
      })
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

    await Issue.findByIdAndDelete(issueId);
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

    const issue = await Issue.findById(issueid)
      .select("title description createdAt createdBy status")
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

    if(!state||!issueId) return res.sendStatus(400)

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

    const issues=await Issue.findById(issueId)
    console.log(issues)

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

    await Issue.deleteOne({
      _id: issueId,
      group: groupId,
    });
    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
};
