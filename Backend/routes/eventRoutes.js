import express from "express";
import {
  createEvent,
  getAnalytics,
  getFeed,
} from "../controllers/eventController.js";

const router = express.Router();

export default (io) => {
  router.post("/", (req, res) => createEvent(req, res, io));
  router.get("/feed", getFeed);
  router.get("/top", getAnalytics);
  return router;
};
