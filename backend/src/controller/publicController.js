import ContactMessage from "../model/contactModal.js";
import groq from "../config/groq.js";

export const PublicContactMessage = (req, res, next) => {
  try {
    const { fullName, email, message } = req.body;
    console.log(req.body);

    if (!fullName || !email || !message) {
      const error = new Error("All Field Required");
      error.statusCode = 400;
      return next(error);
    }

    const contactMessage = ContactMessage.create({
      fullName,
      email,
      message,
    });

    console.log("Received contact message:", { fullName, email, message });
    res.status(201).json({
      message: "Contact message received. \n We'll get back to you soon!",
    });
  } catch (error) {
    next(error);
  }
};

export const GuestChatWithAI = async (req, res, next) => {
  try {
    const { message } = req.body;

    console.log("Received message:", message);

    if (!message) {
      const error = new Error("Message is required");
      error.statusCode = 400;
      return next(error);
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    console.log("AI Reply:", reply);

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("AI Error:", error);
    error.statusCode = 500;
    error.message = "AI server error";
    next(error);
  }
};
