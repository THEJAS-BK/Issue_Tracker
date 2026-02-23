const Group=require("../models/group");
const Issue=require("../models/issue")
module.exports.isPartOfGroup=async(req,res,next)=>{
    let {groupId}=req.params;
    const user=req.user;

    if(!groupId){
        groupId=req.query.q;
    }
    if(!groupId){
         console.log("mem middleware failed",groupId)
        return res.status(400).json({message:"Group ID is required"});
    }
    const members =await Group.findById(groupId).select("members");
   
    const group = members.members.find(g => g.userId.toString() === user.userId);
    if(!group){
        return res.status(403).json({message:"You are not a member of this group",code:"notPartOfGroup"});
    }
    next();
}
//!only when issue id is available
module.exports.isPartOfGroupByIssueId=async(req,res,next)=>{
    let {issueId}=req.params;
    const user=req.user;

    if(!issueId){
        return res.status(400).json({message:"Issue ID is required"});
    }
    const issue = await Issue.findById(issueId);
    let groupId=issue.group;
    const members =await Group.findById(groupId).select("members");
   
    const group = members.members.find(g => g.userId.toString() === user.userId);
    if(!group){
        return res.status(403).json({message:"You are not a member of this group",code:"notPartOfGroup"});
    }
    next();
}
//!is admin or coadmin
module.exports.isAdminOrCoAdmin=async(req,res,next)=>{
    let {groupId}=req.params;
    const user=req.user;

    if(!groupId){
        groupId=req.query.q;
    }
    if(!groupId){
         console.log("admin middleware failed",groupId)
        return res.status(400).json({message:"Group ID is required"});
    }
    const members =await Group.findById(groupId).select("members"); 
   
    const mem = members.members.find(g => g.userId.toString() === user.userId);
    if(!mem){
        return res.status(403).json({message:"You are not a member of this group",code:"notPartOfGroup"});
    }
    if(mem.role==="admin" || mem.role==="coadmin"){
        next();
    }else{
        return res.status(403).json({message:"You are not an admin or coadmin of this group",code:"notAdminOrCoAdmin"});
    }
}
//!is admin or coadmin using issueId
module.exports.isAdminOrCoAdminByIssueId=async(req,res,next)=>{
    let {issueId}=req.params;
    const user=req.user;

    if(!issueId){
        return res.status(400).json({message:"Issue ID is required"});
    }
    const issue = await Issue.findById(issueId);
    let groupId=issue.group;
    const members =await Group.findById(groupId).select("members"); 
   
    const mem = members.members.find(g => g.userId.toString() === user.userId);
    
    if(!mem){
        return res.status(403).json({message:"You are not a member of this group",code:"notPartOfGroup"});
    }
    if(mem.role==="admin" || mem.role==="coadmin"){
        next();
    }else{
        return res.status(403).json({message:"You are not an admin or coadmin of this group",code:"notAdminOrCoAdmin"});            
    }
}
