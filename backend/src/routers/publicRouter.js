import express from "express";
import {
  PublicContactMessage,
  GuestChatWithAI,
} from "../controller/publicController.js";
import { GuestChatLimit } from "../middleware/chatUseLimit.js";
const router = express.Router();

router.post("/contactMessage", PublicContactMessage);
router.post("/chat", GuestChatLimit, GuestChatWithAI);

export default router;
