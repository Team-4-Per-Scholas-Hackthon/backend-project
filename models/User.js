// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

// const { Schema } = mongoose;


// const UserSchema = new Schema(
// 	{

// 		// models/User.js – add fields Amaris
// selectedSkills: { type: [String], default: [] },
// bio: { type: String, default: "" },
// track: { type: String, default: "" },
// preferredSessionLength: { type: Number, default: 30 },
// preferredSessionType: {
//   type: String,
//   enum: ["video", "chat", "both"],
//   default: "both",
// },
// timezone: { type: String, default: "America/New_York" },
// // Amaris above

// 		username: { type: String, required: true, unique: true, trim: true },
// 		firstname: { type: String, trim: true },
// 		lastname: { type: String, trim: true },
// 		email: {
// 			type: String,
// 			required: true,
// 			unique: true,
// 			lowercase: true,
// 			trim: true,
// 			match: [/.+@.+\..+/, "Must match an email address!"],
// 		},
// 		githubId: { type: String },
// 		password: { type: String, required: true },
// 		role: {
// 			type: String,
// 			enum: ["alumni", "learner", "admin"],
// 			required: true,
// 			default: "learner",
// 		},

// 		// Alumni fields
// 		skills: { type: [String], default: [] },
// 		cohort: { type: String, trim: true },
// 		sessions: { type: [Date], default: [] },

// 		// Availability: list of specific dates with optional time ranges
// 		availability: [
// 			{
// 				date: { type: Date, required: true }, // exact date user is available
// 				startTime: { type: String }, // optional, e.g. "09:00"
// 				endTime: { type: String }, // optional, e.g. "17:00"
// 			},
// 		],
// 	},
// 	{ timestamps: true }
// );



// // Set up pre-save middleware to create password
// UserSchema.pre("save", async function (next) {
// 	if (this.isNew || this.isModified("password")) {
// 		const saltRounds = 10;
// 		this.password = await bcrypt.hash(this.password, saltRounds);
// 	}
// });

// // Compare the incoming password with the hashed password
// //creating our own method
// UserSchema.methods.isCorrectPassword = async function (password) {
// 	return bcrypt.compare(password, this.password);
// };

// module.exports = mongoose.model("User", UserSchema);




// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    // Learner profile fields (Amaris)
    selectedSkills: { type: [String], default: [] },
    bio: { type: String, default: "" },
    track: { type: String, default: "" },
    preferredSessionLength: { type: Number, default: 30 },
    preferredSessionType: {
      type: String,
      enum: ["video", "chat", "both"],
      default: "both",
    },
    timezone: { type: String, default: "America/New_York" },

    // Core identity
    username: { type: String, required: true, unique: true, trim: true },
    firstname: { type: String, trim: true },
    lastname: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Must match an email address!"],
    },
    githubId: { type: String },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["alumni", "learner", "admin"],
      required: true,
      default: "learner",
    },

    // Shared / alumni fields
    skills: { type: [String], default: [] },
    cohort: { type: String, trim: true },
    sessions: { type: [Date], default: [] },

    // Availability: list of specific dates with optional time ranges
    availability: [
      {
        date: { type: Date, required: true }, // exact date user is available
        startTime: { type: String }, // optional, e.g. "09:00"
        endTime: { type: String }, // optional, e.g. "17:00"
      },
    ],
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Compare incoming password with hashed password
UserSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);