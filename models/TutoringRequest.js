const mongoose = require("mongoose");

const { Schema } = mongoose;

const TutoringRequestSchema = new Schema(
  {
    learnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // What help is needed
    title: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true }, // e.g. "CLOUD", "DATA", "JS"
    description: { type: String, trim: true },

    // Optional scheduling preference
    preferredDate: { type: Date },

    // Request lifecycle
    status: {
      type: String,
      enum: ["OPEN", "ACCEPTED", "CLOSED", "CANCELLED","DECLINED"],
      default: "OPEN",
      required: true,
    },

    // When a tutor accepts
    assignedTutorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Helpful indexes for tutor browsing + admin metrics
TutoringRequestSchema.index({ status: 1, topic: 1, createdAt: -1 });
TutoringRequestSchema.index({ learnerId: 1, createdAt: -1 });

module.exports = mongoose.model("TutoringRequest", TutoringRequestSchema);