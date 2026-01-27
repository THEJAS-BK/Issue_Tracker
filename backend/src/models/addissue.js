const mongoose = reqquire("mongoose")

const addIssueSchema=mongoose.Schema({
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
        required:true
    }
})