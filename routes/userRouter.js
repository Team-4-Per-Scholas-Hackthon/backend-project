const express = require("express");

const {
	listUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	registerUser,
	loginUser,
	getUserDashboard,
	createTutoringRequest
} = require("../controllers/userController");


const { authMiddleware, adminOnly, signToken } = require("../middleware/auth");

//passport
const passport = require("passport");

const userRouter = express.Router();

// GET /users - list all users
userRouter.get("/", listUsers);

// GET /users/:id/dashboard
// userRouter.get("/:id/dashboard", getUserDashboard);
userRouter.get("/dashboard", authMiddleware, getUserDashboard);

// GET /users/:id - get user by id
userRouter.get("/:id", getUserById);

// POST /users - create a new user
userRouter.post("/", createUser);

// PUT /users/:id - update a user
userRouter.put("/:id", authMiddleware, updateUser);

// DELETE /users/:id - delete a user
userRouter.delete("/:id", authMiddleware, deleteUser);

/**
 * POST /users/register
 */
userRouter.post("/register", registerUser);

/**
 * POST /users/login
 */
userRouter.post("/login", loginUser);

// Route to start the OAuth flow
// When a user visits this URL, they will be redirected to GitHub to log in.
userRouter.get(
	"/auth/github",
	passport.authenticate("github", { scope: ["user:email"] }) // Request email scope
);

// The callback route that GitHub will redirect to after the user approves.
userRouter.get(
	"/auth/github/callback",
	passport.authenticate("github", {
		failureRedirect: "/login", // Where to redirect if user denies
		session: false, // We are using tokens, not sessions
	}),
	(req, res) => {
		// At this point, `req.user` is the user profile returned from the verify callback.
		// We can now issue our own JWT to the user.
		const token = signToken(req.user);
		// Redirect the user to the frontend with the token, or send it in the response
		res.redirect(`http://localhost:5173?token=${token}`);
	}
);


// GET /users/:id/availability
userRouter.get("/:id/availability", async (req, res) => {
  try {
    const User = require("../models/User");

    const user = await User.findById(req.params.id)
      .select("username firstname lastname availability");

    if (!user) return res.status(404).json({ error: "User not found" });

    const events = user.availability.map((a) => ({
      title: user.firstname || user.username,
      date: a.date.toISOString().slice(0, 10), // YYYY-MM-DD for FullCalendar
    }));

    res.json(events);
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});

module.exports = userRouter;
