const mongoose = require("mongoose")
const path = require("path")
require("dotenv").config({
    path:path.resolve(__dirname,"../.env")
});

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})
module.exports=mongoose.model("User",userSchema)
