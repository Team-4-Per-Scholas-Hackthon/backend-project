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

const User = require("../models/User"); //Amaris

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

// GET /users/:id/dashboard  (protected)
userRouter.get("/:id/dashboard", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow user to see their own dashboard unless admin
    if (req.user._id !== id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this dashboard" });
    }

    // Base user record
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Here you can aggregate whatever the dashboard needs
    // Example placeholders:
    // const sessions = await Session.find({ user: id });
    // const learnerProfile = await LearnerProfile.findOne({ user: id });
    // const tutorStats = await TutorStats.findOne({ user: id });

    res.json({
      user,
      role: user.role,
      // sessions,
      // learnerProfile,
      // tutorStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading dashboard" });
  }
});

// // Amaris
// // Get current learner profile
// userRouter.get("/me/profile", authMiddleware, async (req, res) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "Not authenticated" });
//   }
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user || user.role !== "learner") {
//       return res.status(403).json({ message: "Not a learner" });
//     }

//     res.json({
//       selectedSkills: user.selectedSkills || [],
//       bio: user.bio || "",
//       cohort: user.cohort || "",
//       track: user.track || "",
//       preferredSessionLength: user.preferredSessionLength || 30,
//       preferredSessionType: user.preferredSessionType || "both",
//       timezone: user.timezone || "America/New_York",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to load learner profile" });
//   }
// });

// // Create or update learner profile
// userRouter.put("/me/profile", authMiddleware, async (req, res) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "Not authenticated" });
//   }
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user || user.role !== "learner") {
//       return res.status(403).json({ message: "Not a learner" });
//     }

//     const {
//       selectedSkills,
//       bio,
//       cohort,
//       track,
//       preferredSessionLength,
//       preferredSessionType,
//       timezone,
//     } = req.body;

//     if (selectedSkills) user.selectedSkills = selectedSkills;
//     if (bio !== undefined) user.bio = bio;
//     if (cohort !== undefined) user.cohort = cohort;
//     if (track !== undefined) user.track = track;
//     if (preferredSessionLength !== undefined)
//       user.preferredSessionLength = preferredSessionLength;
//     if (preferredSessionType !== undefined)
//       user.preferredSessionType = preferredSessionType;
//     if (timezone !== undefined) user.timezone = timezone;

//     await user.save();

//     res.json({
//       selectedSkills: user.selectedSkills,
//       bio: user.bio,
//       cohort: user.cohort,
//       track: user.track,
//       preferredSessionLength: user.preferredSessionLength,
//       preferredSessionType: user.preferredSessionType,
//       timezone: user.timezone,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to save learner profile" });
//   }
// });



// Amaris – unified "me profile" for learner + alumni
userRouter.get("/me/profile", authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Common fields
    const base = {
      role: user.role,
      selectedSkills: user.selectedSkills || [],
      bio: user.bio || "",
      cohort: user.cohort || "",
      track: user.track || "",
      preferredSessionLength: user.preferredSessionLength || 30,
      preferredSessionType: user.preferredSessionType || "both",
      timezone: user.timezone || "America/New_York",
      skills: user.skills || [],
      availability: user.availability || [],
    };

    // You can branch on role if the frontend ever needs different shapes
    return res.json(base);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load profile" });
  }
});

userRouter.put("/me/profile", authMiddleware, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      selectedSkills,
      bio,
      cohort,
      track,
      preferredSessionLength,
      preferredSessionType,
      timezone,
      skills,
      availability,
    } = req.body;

    // Shared/learner fields
    if (selectedSkills !== undefined) user.selectedSkills = selectedSkills;
    if (bio !== undefined) user.bio = bio;
    if (cohort !== undefined) user.cohort = cohort;
    if (track !== undefined) user.track = track;
    if (preferredSessionLength !== undefined) {
      user.preferredSessionLength = preferredSessionLength;
    }
    if (preferredSessionType !== undefined) {
      user.preferredSessionType = preferredSessionType;
    }
    if (timezone !== undefined) user.timezone = timezone;

    // Alumni‑style fields
    if (skills !== undefined) user.skills = skills;
    if (availability !== undefined) user.availability = availability;

    await user.save();

    res.json({
      role: user.role,
      selectedSkills: user.selectedSkills || [],
      bio: user.bio || "",
      cohort: user.cohort || "",
      track: user.track || "",
      preferredSessionLength: user.preferredSessionLength || 30,
      preferredSessionType: user.preferredSessionType || "both",
      timezone: user.timezone || "America/New_York",
      skills: user.skills || [],
      availability: user.availability || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save profile" });
  }
});

module.exports = userRouter;
