const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConnect = require("./config/dbConnect");

dotenv.config();

//Database COnnection
dbConnect();

const app = express();
const PORT = process.env.PORT || 4000;

// ===== Middleware =====
app.use(morgan("dev"));
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// for availability
app.use("/availability", require("./routes/availabilityRouter"));
app.use("/requests", require("./routes/requestRouter"));
require("./config/passport");

app.get("/", (req, res) => {
	res.send("Hello World!");
});
// ===== Routes =====
app.use("/users", require("./routes/userRouter"));

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
