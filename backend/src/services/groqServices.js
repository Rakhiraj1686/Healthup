import groq from "../config/groq.js";

export const getAIResponse = async (prompt) => {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `
            You are a structured fitness AI assistant.
            If user data exists:
            → Give direct advice.

            If missing:
            → Ask only missing info.

            Never repeat onboarding.
            Keep answers concise.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content;
};

export const getExtendedAIResponse = async ({ prompt, context = {} }) => {
  // Premium Coaching Layer - Point 4: Extended AI chat responses with deeper, structured coaching context.
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `
          You are a premium fitness coach AI.
          Provide deeper responses with:
          1) Clear reasoning from user context
          2) Action plan for next 7 days
          3) Risk checks (recovery, adherence, overload)
          4) A concise summary at end
          Keep the tone practical and evidence-oriented.
        `,
      },
      {
        role: "user",
        content: `User context: ${JSON.stringify(context)}\n\nQuestion: ${prompt}`,
      },
    ],
    temperature: 0.5,
    max_completion_tokens: 700,
  });

  return completion.choices[0].message.content;
};
