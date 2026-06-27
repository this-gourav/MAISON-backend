const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => 
        console.log("DB connected"))
    .catch((error)=> {
        console.log(error);
        console.log("Issue with DataBase");
        console.error(error.message);
    });
}

module.exports = dbConnect;