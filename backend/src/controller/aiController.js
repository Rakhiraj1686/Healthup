// export const getDietSuggestion = async (req, res) => {
//   const { type } = req.body;

//   const suggestions = {
//     breakfast: [
//       "Oats with Fruits",
//       "Boiled Eggs & Brown Bread",
//       "Poha",
//       "Upma",
//       "Smoothie Bowl",
//       "Sprouts Salad",
//       "Paneer Sandwich",
//       "Idli Sambar"
//     ],
//     lunch: [
//       "Brown Rice + Dal",
//       "Chapati + Mix Veg",
//       "Grilled Chicken + Salad",
//       "Rajma Chawal",
//       "Paneer Curry",
//       "Quinoa Bowl",
//       "Khichdi",
//       "Curd Rice"
//     ],
//     dinner: [
//       "Vegetable Soup",
//       "Grilled Fish",
//       "Paneer Salad",
//       "Boiled Vegetables",
//       "Chicken Soup",
//       "Oats Khichdi",
//       "Light Dal + Roti",
//       "Stir Fry Veggies"
//     ]
//   };

//   res.status(200).json({
//     success: true,
//     data: suggestions[type] || []
//   });
// };

import OpenAI from "openai";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateDietPlan = async (req, res, next) => {
  try {
    const { age, gender, height, weight, goal, diet } = req.body;

    const prompt = `
Create a healthy 1 day diet plan.

Age: ${age}
Gender: ${gender}
Height: ${height} cm
Weight: ${weight} kg
Goal: ${goal}
Diet type: ${diet}

Include breakfast, lunch, dinner and snacks.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      diet_plan: response.choices[0].message.content,
    });
  } catch (error) {
    next(error);
  }
};

export const generateWorkoutPlan = async (req, res, next) => {
  try {
    const { age, weight, goal, level } = req.body;

    const prompt = `
Generate a weekly workout plan.

Age: ${age}
Weight: ${weight}
Goal: ${goal}
Fitness level: ${level}

Include exercises, sets and reps.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      workout_plan: response.choices[0].message.content,
    });
  } catch (error) {
    next(error);
  }
};
