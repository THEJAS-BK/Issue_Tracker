const Group =require("../models/group");
const getInviteCode=(length=6)=>{
    let inviteCode = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < length; i++) {
        inviteCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return inviteCode;
}
async function getUniqueInviteCode(){
    let code;
    let exist=true;
    while(exist){
        code=getInviteCode(6);
        exist = await Group.exists({inviteCode:code})
    }
    return code;
}
module.exports={
    getInviteCode,
    getUniqueInviteCode
}