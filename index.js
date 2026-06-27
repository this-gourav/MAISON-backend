const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());
const cors = require("cors");
const User = require("./models/user");
app.use(cors());


const PORT = process.env.PORT || 4000;

const dbConnect = require("./config/database");
dbConnect();

const user = require("./routes/cloth");
app.use("/api/v1",user);





app.listen(PORT ,()=> {
    
       console.log(`App is Started at ${PORT}`);
    })
