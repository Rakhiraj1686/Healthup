import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
    },
    type: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open"
    },
    solution: {
      type: String,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;