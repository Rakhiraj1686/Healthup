import mongoose from "mongoose";

const badgeDefinitionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["streak", "consistency", "weight", "milestone"],
      required: true,
    },
    criteria: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "badge_definitions",
  },
);

const userBadgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    badgeCode: {
      type: String,
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "user_badges",
  },
);

userBadgeSchema.index({ user: 1, badgeCode: 1 }, { unique: true });

const BadgeDefinition = mongoose.model("BadgeDefinition", badgeDefinitionSchema);
const UserBadge = mongoose.model("UserBadge", userBadgeSchema);

export { BadgeDefinition, UserBadge };
