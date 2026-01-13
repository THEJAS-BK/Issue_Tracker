const mongoose = require("mongoose")
const path = require("path")
require("dotenv").config({
    path:path.resolve(__dirname,"../.env")
});

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
    },
    refreshToken:{
        type:String,
        default:null,
    }

})
module.exports=mongoose.model("User",userSchema)
