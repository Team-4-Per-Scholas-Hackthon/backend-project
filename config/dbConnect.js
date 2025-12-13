const mongoose = require("mongoose");

// Database Connection
const dbCOnnect = () =>
	mongoose
		.connect(process.env.MONGO_URI)
		.then(() => console.log("Successfully connected to MongoDB!"))
		.catch((err) => console.error("Connection error", err));

module.exports = dbCOnnect;
