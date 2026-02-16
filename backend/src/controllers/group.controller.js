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