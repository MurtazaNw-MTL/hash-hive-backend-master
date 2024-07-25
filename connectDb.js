const mongoose = require("mongoose");
require("dotenv").config();
const { MONGO_URI } = process.env;
console.log(MONGO_URI);
mongoose.set("strictQuery", true);
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

let checkConn = async () => await mongoose.connect(MONGO_URI, options);

let connection = checkConn();
if (connection) {
    console.log("db connected");
} else {
    console.log("Error while connecting db");
}