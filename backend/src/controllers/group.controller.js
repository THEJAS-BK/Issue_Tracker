const mongoose =require("mongoose")

//?schemas
const Group = require("../models/group");
const ExpressError = require("../utils/ExpressError");
const Issue = require("../models/issue");


//utils
const { getUniqueInviteCode } = require("../utils/inviteCode");


//!create group
module.exports.createGroup=async (req, res, next) => {
  try {
    const {
      groupname,
      description,
      joinapproval,
      imageuploadpermission,
    } = req.body;
    const inviteCode = await getUniqueInviteCode();
    const newGroup = new Group({
      groupname,
      description,
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
}
//!get all groups for home page
module.exports.getAllGroups= async (req, res,next) => {
  try {
    const curUser = req.user.userId;
    if (!curUser) return res.status(401);

    const allGroups = await Group.find({
      members: { $elemMatch: { userId: req.user.userId } },
    }).select("groupname description inviteCode");

    const allissues = await Issue.find({
      group: { $in: allGroups.map((g) => g._id) },
    });
    const issues = allissues.filter(
      (issue) => issue.createdBy.toString() === curUser,
    );
    res.json({ allGroups, issues });
  } catch (err) {
    next(err)
  }
}
//!search groups globally
module.exports.searchAllGroups=async (req, res,next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return next(new ExpressError("search query is required", 400));
    }
    if (q.length == 6) {
      const allGroups = await Group.findOne({ inviteCode: q })
        .select("groupname visibility joinType")
        .populate("createdBy", "name");

      if (allGroups) {
        return res.json({ allGroups: [allGroups] });
      }
    }
    const allGroups = await Group.find({
      groupname: { $regex: q, $options: "i" },
    })
      .select("groupname visibility joinType")
      .populate("createdBy", "name");
    res.json({ allGroups });
  } catch (err) {
    next(err)
  }
}
//!open to join group join btn
module.exports.joinSearchedGroups=async (req, res, next) => {
  try {
    const { groupid } = req.params;
    const checkIfExist = await Group.findOne({
      _id: groupid,
      members: { $elemMatch: { userId: req.user.userId } },
    });
    if (checkIfExist) {
      return res.sendStatus(409);
    }

    await Group.findByIdAndUpdate(
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
}
//! reqest to join group code in global search
module.exports.joinGroupRequest= async (req, res, next) => {
    try {
      const { groupId } = req.params;
      if (!groupId) return res.sendStatus(400);

      const curUser = req.user.userId;
      if (!curUser) return res.sendStatus(401);

      if (!mongoose.Types.ObjectId.isValid(groupId)) return res.sendStatus(404);

      const group = await Group.findById(groupId);
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

      await Group.findByIdAndUpdate(groupId, {
        $push: {
          joinRequests: { userId: curUser },
        },
      });
      res.sendStatus(201);
    } catch (err) {
      next(err);
    }
  }
//!search the groups you joined
module.exports.searchJoinedGroups=async (req, res,next) => {
  try {
    const { val } = req.body;
    if (val.length == 6) {
      const allGroups = await Group.findOne({ inviteCode: val });
      if (allGroups) {
        return res.json({ allGroups });
      }
    }

    const allGroups = await Group.find({
      groupname: { $regex: val, $options: "i" },
    });
    res.json({ allGroups });
  } catch (err) {
    next(err);
  }
}