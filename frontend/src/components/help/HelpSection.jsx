import { useState } from "react";
import Modal from "./Modal";

export default function HelpSection() {
  const [activeModal, setActiveModal] = useState(null);

  const content = {
    habit: {
      title: "Habit Score Help",
      text: `
HealthUP AI Habit Score is a structured behavioral intelligence metric designed to measure long-term consistency rather than short-term motivation.

Calculation Logic:
Habit Score = (Workout Adherence × 60%) + (Diet Adherence × 40%)

Workout adherence measures completion rate of scheduled sessions.
Diet adherence measures how closely calorie and macro targets were followed.

Why 60/40 Weightage?
Because structured physical execution drives adaptation, while nutrition ensures metabolic support.

Score Interpretation:
90–100  → Elite consistency, high transformation probability
75–89   → Strong discipline with minor improvement scope
60–74   → Inconsistent adherence, moderate risk
Below 60 → Drop-off risk detected

Adaptive Response System:
If score declines for 2 consecutive weeks:
• Reduce training load
• Suggest schedule reset
• Trigger motivational prompts
• Recommend habit simplification

The goal is sustainable identity-based habit formation — not temporary compliance.
`,
    },

    diet: {
      title: "Diet Plan Intelligence",
      text: `
HealthUP AI generates nutrition plans using a scientifically grounded metabolic framework.

Step 1 – Basal Metabolic Rate:
Calculated using the Mifflin-St Jeor Equation.

Step 2 – Total Daily Energy Expenditure:
Adjusted using activity multiplier.

Step 3 – Goal-Based Calorie Strategy:
• Weight Loss → Controlled deficit (300–500 kcal)
• Muscle Gain → Structured surplus (250–400 kcal)
• Recomposition → Mild deficit with high protein
• Endurance → Carb-optimized performance model

Macro Distribution Logic:
• Protein optimized for muscle preservation
• Carbohydrates aligned with training intensity
• Fats maintained for hormonal stability

Safety Protocols:
• Calorie floor protection
• No extreme crash dieting
• Weekly progress recalibration

HealthUP AI prioritizes metabolic health, performance sustainability, and long-term adherence.
`,
    },

    workout: {
      title: "Adaptive Workout Intelligence",
      text: `
HealthUP AI operates on a Progressive Overload + Recovery Balance Model.

Initial Programming Based On:
• Goal type
• Training experience
• Weekly availability
• Fatigue patterns

Dynamic Adjustment Engine:

If completion ≥ 90% for 2 weeks:
→ Increase volume or load by 5–10%

If completion < 50%:
→ Reduce intensity
→ Lower total sets
→ Introduce recovery micro-cycle

If 3 high-fatigue logs in 7 days:
→ Force structured recovery day
→ Replace heavy session with mobility / active recovery

For Muscle Gain:
Gradual load progression ensures hypertrophy stimulus.

For Fat Loss:
Cardio volume scales without compromising recovery.

This prevents overtraining, burnout, and plateau formation.
`,
    },

    support: {
      title: "Technical & System Support",
      text: `
HealthUP AI is built using a secure full-stack architecture.

Security Layer:
• Password hashing (bcrypt / Argon2)
• JWT-based authentication
• Session validation & timeout handling

System Integrity:
• Backend API validation
• Database consistency checks
• Structured error handling

Common Support Scenarios:
• Plan generation mismatch
• Dashboard data sync delay
• Session expiration
• Input validation errors

Before raising a ticket:
1. Ensure profile data is complete
2. Re-login to refresh token
3. Verify internet connectivity

Our system logs:
• User ID
• Timestamp
• Module error
• Stack trace (if applicable)

HealthUP AI is designed for reliability, transparency, and user safety.
`,
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Box
        title="Habit Score Help"
        description="Click to learn more about habit score help."
        onClick={() => setActiveModal("habit")}
      />

      <Box
        title="Diet Plan Questions"
        description="Click to learn more about diet plan questions."
        onClick={() => setActiveModal("diet")}
      />

      <Box
        title="Workout Adjustments"
        description="Click to learn more about workout adjustments."
        onClick={() => setActiveModal("workout")}
      />

      <Box
        title="Technical Support"
        description="Click to learn more about technical support."
        onClick={() => setActiveModal("support")}
      />

      {activeModal && (
        <Modal
          title={content[activeModal].title}
          onClose={() => setActiveModal(null)}
        >
          {content[activeModal].text}
        </Modal>
      )}
    </div>
  );
}

function Box({ title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-900 p-6 rounded-2xl cursor-pointer border border-gray-700 hover:border-purple-500 transition-all duration-300"
    >
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="text-gray-400 mt-2">{description}</p>
    </div>
  );
}
