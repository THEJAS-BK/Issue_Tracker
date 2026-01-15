const mongoose = require("mongoose")

const dashboardSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    raisedissue:{
        type:Number,
        default:0
    },
    solvedissue:{
        type:Number,
        default:0
    },
})