const express = require("express");
const requestRouter = express.Router();

const { authMiddleware } = require("../middleware/auth");
const {
  createTutoringRequest,
  getRequests,
  acceptRequest,
  declineRequest,
} = require("../controllers/requestController");

// GET /requests
requestRouter.get("/", authMiddleware, getRequests);

// POST /requests
requestRouter.post("/", authMiddleware, createTutoringRequest);

// for tutor to accept or decline a request
requestRouter.patch("/:id/accept", authMiddleware, acceptRequest);
requestRouter.patch("/:id/decline", authMiddleware, declineRequest);

module.exports = requestRouter;