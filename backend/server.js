const express = require("express");
const mongoose = require("mongoose")
require("dotenv").config();
const bcrypt = require("bcrypt")


//setups
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))

//Mongo connection
main().then(()=>{
    console.log("connected to db")
}).catch((err)=>{
    console.log(err)
})
async function main(){
    await mongoose.connect(process.env.MONGO_URL);
}
app.get("/",(req,res)=>{
    res.json({name:"Backend guy",message:"Hello from me the backend guy"})
})
// Auth section 
app.post("/signup",async (req,res)=>{
    console.log(req.body);

})

app.listen(8080,()=>{
    console.log("server started at port 8080")
})