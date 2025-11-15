import express from "express";
import createCommentModel from "../models/commentModel.js";

const router = express.Router();

// This function will receive the DB connection from server.js
export default function(db) {
  const Comment = createCommentModel(db);

  // GET first comment by date
  router.get("/first", async (req, res) => {
    try {
      const firstComment = await Comment.findOne().sort({ date: 1 });
      if (!firstComment) return res.status(404).json({ message: "No comments found" });
      res.json(firstComment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error getting comment" });
    }
  });

  // GET comment by ObjectId
  router.get("/:id", async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) return res.status(404).json({ message: "Comment not found" });
      res.json(comment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching comment" });
    }
  });

  // PUT update comment text
  router.put("/:id", async (req, res) => {
    const { text } = req.body;
    try {
      const updatedComment = await Comment.findByIdAndUpdate(
        req.params.id,
        { text },
        { new: true }
      );
      if (!updatedComment) return res.status(404).json({ message: "Comment not found" });
      res.json(updatedComment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error updating comment" });
    }
  });

  return router;
}
