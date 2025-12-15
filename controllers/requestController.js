const TutoringRequest = require("../models/TutoringRequest");

async function createTutoringRequest(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // only learners can create requests
    if (req.user.role !== "learner") {
      return res.status(403).json({ message: "Only learners can create requests" });
    }

    const { title, topic, description, preferredDate } = req.body;

    if (!title || !topic) {
      return res.status(400).json({ message: "title and topic are required" });
    }

    const newRequest = await TutoringRequest.create({
      learnerId: req.user._id,
      title,
      topic,
      description,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      status: "OPEN",
    });

    res.status(201).json({ message: "Request created", request: newRequest });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
}

///get request:

async function getRequests(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // If learner: only their requests
    if (req.user.role === "learner") {
      const requests = await TutoringRequest.find({ learnerId: req.user._id })
        .sort({ createdAt: -1 });
      return res.json(requests);
    }

    // If tutor/admin: see OPEN requests (simple MVP)
    if (req.user.role === "alumni" || req.user.role === "admin") {
      const requests = await TutoringRequest.find({ status: "OPEN" })
        .sort({ createdAt: -1 });
      return res.json(requests);
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
}

async function acceptRequest(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // only tutors (alumni) can accept (or admin if you want)
    if (req.user.role !== "alumni" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only tutors/admin can accept requests" });
    }

    const request = await TutoringRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "OPEN") {
      return res.status(400).json({ message: `Request is not open (status: ${request.status})` });
    }

    request.status = "ACCEPTED";
    request.assignedTutorId = req.user._id;
    await request.save();

    res.json({ message: "Request accepted", request });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
}

async function declineRequest(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // only tutors (alumni) can decline (or admin)
    if (req.user.role !== "alumni" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only tutors/admin can decline requests" });
    }

    const request = await TutoringRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== "OPEN") {
      return res.status(400).json({ message: `Request is not open (status: ${request.status})` });
    }

    request.status = "DECLINED";
    await request.save();

    res.json({ message: "Request declined", request });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
}

module.exports = {
  createTutoringRequest,
  getRequests,
  acceptRequest,
  declineRequest,
};



