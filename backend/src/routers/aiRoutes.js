// import express from "express";
// import { getDietSuggestion } from "../controllers/aiController.js";

// const router = express.Router();

// router.post("/suggest", getDietSuggestion);

// export default router;

import express from "express";
import { generateDietPlan, generateWorkoutPlan } from "../controller/aiController.js";

const router = express.Router();

router.post("/diet", generateDietPlan);
router.post("/workout", generateWorkoutPlan);

export default router;