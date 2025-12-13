const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const donenv = require("dotenv");

donenv.config();

const app = express();
const PORT = 3000;

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
	res.send("Hello World!");
});
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
