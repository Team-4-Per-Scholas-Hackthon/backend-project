const User = require("../models/User");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const expiration = "24h"; // Token will be valid for 2 hours

async function listUsers(req, res) {
	try {
		const users = await User.find();
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
}

async function getUserById(req, res) {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ error: "User not found" });
		res.json(user);
	} catch (err) {
		res.status(400).json({ error: "Invalid ID" });
	}
}

async function createUser(req, res) {
	try {
		const newUser = await User.create(req.body);
		res.status(201).json(newUser);
	} catch (err) {
		res.status(400).json({ error: err.message || "Bad request" });
	}
}

async function updateUser(req, res) {
	try {
		const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!updated) return res.status(404).json({ error: "User not found" });
		res.json(updated);
	} catch (err) {
		res.status(400).json({ error: err.message || "Invalid request" });
	}
}

async function deleteUser(req, res) {
	try {
		const deleted = await User.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: "User not found" });
		res.json({ message: "User deleted" });
	} catch (err) {
		res.status(400).json({ error: "Invalid ID" });
	}
}

async function registerUser(req, res) {
	try {
		//check if email exist
		const alreadyExist = await User.findOne({ email: req.body.email });
		if (alreadyExist) {
			return res.status(400).json({ message: "Email already exists" });
		}
		/** You can also check for username, same login as above */

		//create a new user
		const user = await User.create(req.body);

		res.status(201).json({
			message: `User created: username: ${req.body.username} and email: ${req.body.email}`,
		});
	} catch (error) {
		console.log(error.message);
		//check for username duplication error
		if (error.code === 11000) {
			res.status(400).json({ message: "Username already in use" });
		} else {
			res.status(500).send("An unexpected error occurred.");
		}
	}
}

async function loginUser(req, res) {
	try {
		const { email, password } = req.body;

		//check if user doesn't exist
		const dbUser = await User.findOne({ email });

		if (!dbUser) {
			return res.status(400).json({ message: "Incorrect email or password" });
		}

		//if user found
		const passwordMatched = await dbUser.isCorrectPassword(password);

		if (!passwordMatched) {
			return res.status(400).json({ message: "Incorrect email or password" });
		}

		//Create the JWT payload
		const payload = {
			_id: dbUser._id,
			username: dbUser.username,
			email: dbUser.email,
			role: dbUser.role,
		};

		//Create Token
		const token = jwt.sign({ data: payload }, secret, {
			expiresIn: expiration,
		});

		res.json({ token, dbUser });
	} catch (error) {}
}

module.exports = {
	listUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	registerUser,
	loginUser,
};
