const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    FullName:{
        type:String,
        
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    Password:{
        type:String,
      
    },
    PhoneNumber:{
        type:String,
        //required:true,
    },
    Address:{
        type:String,
        //required:true,
    },
    city:{
        type:String,
        //required:true,
    },
    State:{
        type:String,
        //required:true,
    },
    Pincode:{
        type:String,
        //required:true,
    },

});





module.exports = mongoose.model("User",userSchema);
