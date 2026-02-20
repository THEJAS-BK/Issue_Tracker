const mongoose = require("mongoose");

//?schemas
const Group = require("../models/group");
const ExpressError = require("../utils/ExpressError");
const Issue = require("../models/issue");
const User = require("../models/user")

//utils
const { getUniqueInviteCode } = require("../utils/inviteCode");

//!create group
module.exports.createGroup = async (req, res, next) => {
  try {
    const { groupname, description, joinapproval, imageuploadpermission } =
      req.body;
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
};
//!get all groups for home page
module.exports.getAllGroups = async (req, res, next) => {
  try {
    const curUser = req.user.userId;
    if (!curUser) return res.status(401);

    const userName= await User.findById(curUser).select("name");
    

    const allGroups = await Group.find({
      members: { $elemMatch: { userId: req.user.userId } },
    }).select("groupname description members");


    res.json({ allGroups,userName });
  } catch (err) {
    next(err);
  }
};
//!search groups globally
module.exports.searchAllGroups = async (req, res, next) => {
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
    next(err);
  }
};
//!open to join group join btn
module.exports.joinSearchedGroups = async (req, res, next) => {
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
};
//! reqest to join group code in global search
module.exports.joinGroupRequest = async (req, res, next) => {
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
};
//!search the groups you joined
module.exports.searchJoinedGroups = async (req, res, next) => {
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
};
/* 

?group interface code 

*/
//? get group info for user interface
module.exports.getGroupUserInterface = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const issues = await Issue.find({ group: groupId,isDeleted:false })
      .select("title createdBy createdAt status stayAnonymous")
      .populate("createdBy", "name");
    //send cur user
    const curUser = req.user.userId;
    //send all member
    const allmembers = await Group.findById(groupId)
      .select("members")
      .populate("members");
      //cur user role
      const curUserRole=allmembers.members.find((mem)=>{
        return mem.userId.toString() === curUser;
      }).role;
    //get invite code and group name
    const groupDetails = await Group.findOne({ _id: groupId }).select(
      "groupname description inviteCode",
    );
    res.json({ issues, allmembers, curUser, groupDetails, curUserRole });
  } catch (err) {
    next(err);
  }
};

//? get all members in user interface
module.exports.getGroupUserInterfaceMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    if (!groupId) return res.sendStatus(400);

    const state = req.query.state;
    if (!state || !["all", "coadmin", "member"].includes(state))
      return res.sendStatus(400);

    let members = await Group.findById(groupId)
      .select("members")
      .populate("members.userId", "name");

    if (state === "all") {
      members = members.members;
    } else if (state === "coadmin") {
      members = members.members.filter((mem) => {
        return mem.role === "coadmin";
      });
    } else if (state === "member") {
      members = members.members.filter((mem) => {
        return mem.role === "member";
      });
    } else {
      throw new ExpressError("invalid state", 500);
    }
    res.json(members);
  } catch (err) {
    next(err);
  }
};

//? search group members in user interface
module.exports.searchGroupMembersUserInterface = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    if (!groupId) return res.sendStatus(400);

    const val = req.query.q;
    if (!val) return res.sendStatus(400);

    const state = req.query.state;
    if (!state || !["all", "coadmin", "member"].includes(state))
      return res.sendStatus(400);

    let members = await Group.findById(groupId)
      .select("members")
      .populate("members.userId", "name");

    const regex = new RegExp(val, "i");

    if (state === "all") {
      members = members.members.filter((mem) => {
        return regex.test(mem.userId.name);
      });
    } else if (state === "coadmin") {
      members = members.members.filter((mem) => {
        return regex.test(mem.userId.name) && mem.role == "coadmin";
      });
    } else if (state === "member") {
      members = members.members.filter((mem) => {
        return regex.test(mem.userId.name) && mem.role == "member";
      });
    } else {
      next(new ExpressError("invalid state", 500));
    }

    res.json({ members });
  } catch (err) {
    next(err);
  }
};

//!exit group by user
module.exports.exitGroup=async(req,res,next)=>{
  try{
    const {groupId} = req.params;
    const curUser = req.user.userId;

    if(!groupId || !curUser) return res.sendStatus(400);

    const group = await Group.findById(groupId);
    if(!group) return res.sendStatus(404);

    const memberIndex = group.members.findIndex((member) => {
      return member.userId.toString() === curUser;
    });

    if (memberIndex === -1) return res.sendStatus(403);
    group.members.splice(memberIndex, 1);
    
    
    await group.save();
    res.json({message:"Successfully exited the group"});
  }catch(err){
    next(err);
  }
}
/*

    admin pages code

    */

//? get the admin page
module.exports.getAdminPage = async (req, res, next) => {
  try {
    const { groupid } = req.params;
    if (!groupid) return res.sendStatus(400);

    const curUser = req.user.userId;
    if (!curUser) return res.sendStatus(401);

    const issues = await Issue.find({ group: groupid,isDeleted:false })
      .select("title createdBy createdAt status")
      .populate("createdBy", "name");

    const members = await Group.findById(groupid)
      .select("members")
      .populate("members.userId", "_id");

    const role = members.members.find((mem) => {
      return curUser === mem.userId._id.toString();
    }).role;


    const groupDetails = await Group.findById(groupid).select(
      "groupname description inviteCode",
    );
    res.json({ issues, groupDetails,role });
  } catch (err) {
    next(err);
  }
};

//? get edit group page by admin privilages
module.exports.getEditGroupByAdminPage = async (req, res, next) => {
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
};
//? confirm edit group by admin privilages
module.exports.updateGroupByAdmin = async (req, res, next) => {
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
};

//?delete group by admin
module.exports.deleteGroupByAdmin = async (req, res, next) => {
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
};

//?render all members in admin dashboard
module.exports.getGroupMembersAdminPage = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    if (!groupId) return res.sendStatus(400);

    const state = req.query.state;
    if (!state || !["all", "coadmin", "member"].includes(state)) {
      return res.status(400).json({ mes: "Your not a part of the group" });
    }

    const curUser = req.user.userId;
    if (!curUser) res.sendStatus(401);

    if (!mongoose.Types.ObjectId.isValid(groupId)) return res.sendStatus(404);

    let members = await Group.findById(groupId)
      .select("members")
      .populate("members.userId", "name email");

    const curUserRole = members.members.find(
      (mem) => mem.userId._id.toString() === curUser,
    ).role;

    if (state === "coadmin") {
      members = members.members.filter((mem) => mem.role === "coadmin");
    } else if (state === "member") {
      members = members.members.filter((mem) => mem.role === "member");
    } else if (state === "all") {
      members = members.members;
    }
    res.json({ members, curUserRole });
  } catch (err) {
    next(err);
  }
};
//?search members in admin dashboard
module.exports.searchGroupMembersAdminPage = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    if (!groupId) return res.sendStatus(400);

    const searchText = req.query.q;
    if (!searchText) return res.sendStatus(400);

    const state = req.query.state;
    if (!state || !["all", "coadmin", "member"].includes(state)) {
      return res.status(400).json({ mes: "Your not a part of the group" });
    }

    const curUser = req.user.userId;
    if (!curUser) return res.sendStatus(401);

    if (!mongoose.Types.ObjectId.isValid(groupId)) return res.sendStatus(404);

    const allmembers = await Group.findById(groupId)
      .select("members")
      .populate("members.userId", "name email");

    const regex = new RegExp(searchText, "i");
    let members;
    if (state === "all") {
      members = allmembers.members.filter((mem) => {
        return regex.test(mem.userId.name);
      });
    } else if (state === "coadmin") {
      members = allmembers.members.filter((mem) => {
        return regex.test(mem.userId.name) && mem.role === state;
      });
    } else if (state === "member") {
      members = allmembers.members.filter((mem) => {
        return regex.test(mem.userId.name) && mem.role === state;
      });
    }
    const curUserRole = allmembers.members.find(
      (mem) => mem.userId._id.toString() === curUser,
    ).role;

    res.json({ members, curUserRole });
  } catch (err) {
    next(err);
  }
};
//?promotion to coadmin
module.exports.promoteToCoAdmin = async (req, res, next) => {
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
          "members.$.role": "coadmin",
        },
      },
    );
    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
};
//?demotion to member
module.exports.demoteToMember = async (req, res, next) => {
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
};
//?kick member from group
module.exports.kickMemberFromGroup = async (req, res, next) => {
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
};
//! join requests
//?render join requests
module.exports.getJoinRequestsForAdmin = async (req, res, next) => {
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
};
//?accept join request
module.exports.acceptJoinRequest = async (req, res, next) => {
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
};
//?decline join request
module.exports.declineJoinRequest = async (req, res, next) => {
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
};
//?search join requests
module.exports.searchJoinRequestsForAdmin = async (req, res, next) => {
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
};
