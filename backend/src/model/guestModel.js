import mongoose from "mongoose";

const guestSchema = new mongoose.Schema({
  guestId: String,
  messagesUsed: { type: Number, default: 0 },
});

export default mongoose.model("Guest", guestSchema);
