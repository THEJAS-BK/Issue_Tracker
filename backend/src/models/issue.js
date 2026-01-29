const mongoose = require("mongoose")

const issueSchema=mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
         type:String,
        required:true
    },
    category:{
        type:String,    
        required:true
    },
    image:{
        type:String,
        default:""
    }
})
module.exports= mongoose.model("Issue",issueSchema)