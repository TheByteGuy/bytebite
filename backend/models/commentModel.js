import mongoose from "mongoose";

// Define the Comment schema
const commentSchema = new mongoose.Schema({
  name: String,
  email: String,
  movie_id: String,
  text: String,
  date: Date
}, { collection: "movies" }); // force collection name


// Export a function that accepts a DB connection
export default function(db) {
  return db.model("Comment", commentSchema);
}
