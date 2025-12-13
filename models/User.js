const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

// const AvailabilitySchema = new Schema({
//     date: Date,
//     start: String, // e.g. "09:00"
//     end: String,   // e.g. "11:00"
//     notes: String
// }, { _id: false });

const UserSchema = new Schema(
	{
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

		// Alumni fields
		skills: { type: [String], default: [] },
		cohort: { type: String, trim: true },
		// availability: { type: [AvailabilitySchema], default: [] }, // sessions / availability
		sessions: { type: [Date], default: [] },
	},
	{ timestamps: true }
);

// // remove password when converting to JSON
// UserSchema.methods.toJSON = function () {
// 	const obj = this.toObject();
// 	delete obj.password;
// 	return obj;
// };

// // password hashing
// UserSchema.pre("save", async function (next) {
// 	if (!this.isModified("password")) return next();
// 	try {
// 		const salt = await bcrypt.genSalt(10);
// 		this.password = await bcrypt.hash(this.password, salt);
// 		return next();
// 	} catch (err) {
// 		return next(err);
// 	}
// });

// UserSchema.methods.comparePassword = function (candidate) {
// 	return bcrypt.compare(candidate, this.password);
// };

// Set up pre-save middleware to create password
UserSchema.pre("save", async function (next) {
	if (this.isNew || this.isModified("password")) {
		const saltRounds = 10;
		this.password = await bcrypt.hash(this.password, saltRounds);
	}
});

// Compare the incoming password with the hashed password
//creating our own method
UserSchema.methods.isCorrectPassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
