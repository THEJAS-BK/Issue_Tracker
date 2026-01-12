const jwt = require("jsonwebtoken")
module.exports.authorizationToken=(req,res,next)=>{
    const authHeader = req.headers['authorization']
    const token = authHeader.split("")[1];
    console.log(token)
    if(token===null){
        res.status(500).json({message:"not a valid token "})
    }
    

    next();
}