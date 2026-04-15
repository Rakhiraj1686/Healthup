import React, { useEffect, useMemo, useState } from "react";
import HelpSection from "../help/HelpSection";
import axiosInstance from "../../config/Api";

export default function Support() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [ticketType, setTicketType] = useState("Workout Issue");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState("");
  const [ticketError, setTicketError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [tickets, setTickets] = useState([]);

  const visibleTickets = useMemo(() => {
    const fiveMinutesInMs = 5 * 60 * 1000;
    const now = Date.now();

    return tickets.filter((ticket) => {
      if (ticket.status === "Resolved") {
        return false;
      }

      if (!ticket.createdAt) {
        return true;
      }

      const createdAtMs = new Date(ticket.createdAt).getTime();
      return now - createdAtMs <= fiveMinutesInMs;
    });
  }, [tickets]);

  const statusStyles = useMemo(
    () => ({
      Open: "bg-green-500/20 text-green-300 border border-green-500/40",
      "In Progress": "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
      Closed: "bg-red-500/20 text-red-300 border border-red-500/40",
      Resolved: "bg-blue-500/20 text-blue-300 border border-blue-500/40",
    }),
    [],
  );

  const getTicketId = (ticketId) => {
    if (!ticketId) return "#0000";
    const suffix = ticketId.slice(-6);
    const numeric = Number.parseInt(suffix, 16);
    if (Number.isNaN(numeric)) return `#${ticketId.slice(-4).toUpperCase()}`;
    return `#${String(numeric).slice(-4).padStart(4, "0")}`;
  };

  const getTitle = (description) => {
    if (!description) return "General Support Issue";
    const cleaned = description.trim();
    if (cleaned.length <= 48) return cleaned;
    return `${cleaned.slice(0, 48)}...`;
  };

  const getSubtitle = (description) => {
    if (!description) return "No additional details";
    const cleaned = description.trim();
    if (cleaned.length <= 90) return cleaned;
    return `${cleaned.slice(0, 90)}...`;
  };

  const loadTickets = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoadingTickets(true);
      }
      const { data } = await axiosInstance.get("/user/mytickets");
      setTickets(data?.tickets || []);
    } catch (error) {
      setTicketError(
        error?.response?.data?.message ||
          "Unable to fetch your tickets right now. Please try again.",
      );
    } finally {
      if (showLoader) {
        setIsLoadingTickets(false);
      }
    }
  };

  useEffect(() => {
    loadTickets();

    const intervalId = setInterval(() => {
      loadTickets(false);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleTicketSubmit = async () => {
    if (!ticketDescription.trim()) {
      setTicketError("Please describe your issue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setTicketError("");
      setTicketSuccess("");

      const payload = {
        type: ticketType,
        description: ticketDescription.trim(),
      };

      const { data } = await axiosInstance.post("/api/ticket/createTicket", payload);

      setTicketSuccess(data?.message || "Your support ticket has been submitted.");
      setTicketDescription("");
      await loadTickets(false);

      setTimeout(() => {
        setTicketSuccess("");
      }, 3000);
    } catch (error) {
      setTicketError(
        error?.response?.data?.message ||
          "Ticket submission failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const faqs = [
    {
      question: "Why did my calories change?",
      answer:
        "Your calorie target adjusts dynamically based on weight trends, adherence levels, metabolic adaptation, and goal progress. HealthUP AI recalibrates weekly to ensure safe, sustainable transformation.",
    },
    {
      question: "Why is my workout lighter this week?",
      answer:
        "Recent fatigue logs, low completion rate, or recovery indicators triggered an adaptive deload phase. HealthUP AI prioritizes long-term progression over short-term intensity.",
    },
    {
      question: "What is Habit Score?",
      answer:
        "Habit Score measures weekly behavioral consistency using Workout Adherence (60%) and Diet Adherence (40%). It predicts discipline patterns and potential drop-off risk.",
    },
    {
      question: "How does HealthUP AI prevent overtraining?",
      answer:
        "The system monitors fatigue frequency, completion rate, and progressive overload patterns. If recovery signals are detected, volume is reduced or structured recovery sessions are scheduled automatically.",
    },
    {
      question: "How is my goal timeline calculated?",
      answer:
        "Your projected timeline is based on realistic weekly fat loss or muscle gain rates. It updates dynamically using actual progress data rather than static estimates.",
    },
    {
      question: "Can I manually adjust my plan?",
      answer:
        "Yes. You can request modifications. However, HealthUP AI recommendations are data-driven and optimized for long-term sustainability and metabolic safety.",
    },
    {
      question: "Why is my protein intake higher than expected?",
      answer:
        "Protein is optimized to preserve lean muscle mass, enhance recovery, improve satiety, and maintain metabolic rate — especially during calorie deficits.",
    },
    {
      question: "What happens if I stop logging progress?",
      answer:
        "If no data is logged, the system detects inactivity risk. It may simplify your plan, reduce intensity, or send habit continuity reminders.",
    },
    {
      question: "How does HealthUP AI handle plateaus?",
      answer:
        "If weight or performance stagnates for multiple weeks, the system analyzes adherence, recovery, and calorie intake before adjusting macros, training load, or activity volume.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes. HealthUP AI uses encrypted authentication, secure token-based sessions, and protected database architecture to ensure user data privacy and integrity.",
    },
  ];
  // const handleSend = () => {
  //   if (!input.trim()) return;
  //   const newMessages = [
  //     ...messages,
  //     { type: "user", text: input },
  //     {
  //       type: "ai",
  //       text: "This is a demo AI response. Backend logic will analyze user data here.",
  //     },
  //   ];
  //   setMessages(newMessages);
  //   setInput("");
  // };

  return (
    <div className="overflow-y-auto no-scrollbar text-white pb-10 md:py-4">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Support & Help Center</h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">
          Need help with your fitness journey? We're here for you.
        </p>
        <div className="h-1 w-32 bg-linear-to-r from-purple-500 to-purple-700 mt-4 rounded-full"></div>
      </div>

      {/* help section */}
      
      <div className="mb-8 sm:mb-10">
        <HelpSection />
      </div>

      {/* FAQ Section */}
      <div className="mb-8 sm:mb-10">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
          Frequently Asked Questions
        </h2>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-[#111827] border border-gray-700 rounded-xl mb-3 sm:mb-4 p-3 sm:p-5 cursor-pointer hover:border-gray-600 transition-colors"
            onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
          >
            <div className="flex justify-between items-start gap-2 sm:items-center">
              <h3 className="font-medium text-sm sm:text-base">{faq.question}</h3>
              <span className="text-lg shrink-0">{openFAQ === index ? "-" : "+"}</span>
            </div>
            {openFAQ === index && (
              <p className="text-gray-400 mt-2 sm:mt-3 text-xs sm:text-sm">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>

      {/* AI Chat Section */}
      {/* <div className="bg-[#111827] border border-gray-700 rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">Ask FitAI Support</h2>

        <div className="h-64 overflow-y-auto bg-[#0F172A] p-4 rounded-xl mb-4">
          {messages.length === 0 && (
            <p className="text-gray-500 text-sm">
              Ask something like: "Why is my weight not changing?"
            </p>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs ${
                  msg.type === "user" ? "bg-purple-600" : "bg-gray-700"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#0F172A] border border-gray-600 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSend}
            className="bg-linear-to-r from-purple-600 to-purple-800 px-6 py-2 rounded-xl hover:opacity-90 transition"
          >
            Ask
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          This AI provides general guidance only and does not replace medical
          advice.
        </p>
      </div> */}
      {/* Raise Ticket Section */}
      <div className="bg-[#111827] border border-gray-700 rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold">Raise a Support Ticket</h2>
          <span className="text-xs text-gray-400 whitespace-nowrap">Avg response: 24-48 hours</span>
        </div>

        <select
          value={ticketType}
          onChange={(e) => setTicketType(e.target.value)}
          className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-3 sm:px-4 py-2 mb-4 text-sm sm:text-base"
        >
          <option>Workout Issue</option>
          <option>Diet Issue</option>
          <option>Technical Bug</option>
          <option>Other</option>
        </select>

        <textarea
          value={ticketDescription}
          onChange={(e) => setTicketDescription(e.target.value)}
          placeholder="Describe your issue..."
          className="w-full bg-[#0F172A] border border-gray-600 rounded-xl px-3 sm:px-4 py-2 mb-4 h-24 sm:h-28 text-sm sm:text-base"
        ></textarea>

        <button
          onClick={handleTicketSubmit}
          disabled={isSubmitting}
          className="w-full bg-linear-to-r from-purple-600 to-purple-800 py-2 rounded-xl hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base font-medium"
        >
          {isSubmitting ? "Submitting..." : "Submit Ticket"}
        </button>

        {ticketError && <p className="text-red-400 mt-3 text-xs sm:text-sm">{ticketError}</p>}

        {ticketSuccess && (
          <p className="text-green-400 mt-3 text-xs sm:text-sm">✅ {ticketSuccess}</p>
        )}
      </div>

      {/* Disclaimer */}
      <div className="border border-red-600 bg-red-900/20 rounded-xl p-3 sm:p-4 mb-6 text-xs sm:text-sm text-red-300 text-center">
        ⚠This platform provides general fitness guidance and does not replace
        professional medical advice. Always consult a healthcare professional
        before starting a new program.
      </div>
    </div>
  );
}
