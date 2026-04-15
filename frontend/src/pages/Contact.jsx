import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiSend } from "react-icons/fi";
import api from "../config/Api";

const Contact = () => {
  const [contactData, setContactData] = useState({
    fullName: "",
    email: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleClear = () => {
    setContactData({
      fullName: "",
      email: "",
      message: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
  };

  const submitContact = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post("/public/contactMessage", contactData);
      console.log("Contact Data", contactData);
      toast.success(res.data.message);
      handleClear();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error sending message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#030712] text-white py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(168,85,247,0.25),transparent_40%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.25),transparent_40%)]" />

        <div className="max-w-7xl mx-auto relative py-12 z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 bg-linear-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Let's Improve Health Together
            </h1>

            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
              Questions, feedback, or collaboration ideas — HealthUP is always
              open to meaningful conversations that help build better health
              experiences for everyone.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* Info Card */}
            <div className="bg-white/5 backdrop-blur-2xl border border-cyan-400/20 p-8 rounded-3xl shadow-[0_0_35px_rgba(59,130,246,0.3)]">
              <h2 className="text-xl font-semibold mb-6 text-purple-400">
                Connect With HealthUP
              </h2>

              {/* <p className="text-gray-300 mb-6 leading-relaxed">
                Whether you want to share feedback, discuss partnerships, report
                issues, or simply learn more about HealthUP — we're here to
                listen and respond quickly.
              </p> */}

              <p className="text-gray-300 mb-6 leading-relaxed">
                Whether you're exploring new features, facing a technical issue,
                or just curious about what we offer, our team is always ready to
                assist. We strive to provide prompt, friendly, and meaningful
                responses so you always feel supported throughout your journey
                with HealthUP.
              </p>

              <div className="space-y-4 text-gray-300">
                <p>📧 support@healthup.com</p>
                <p>🌐 healthup.netlify.com</p>
                <p>📍 XY, Ground Floor, Bhopal, MP</p>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white/5 backdrop-blur-2xl border border-cyan-400/20 p-8 rounded-3xl shadow-[0_0_35px_rgba(59,130,246,0.3)]">
              <div>
                <div className="text-xl font-semibold mb-6 text-purple-400 ">
                  Get in Touch
                </div>
                <form
                  onSubmit={submitContact}
                  onReset={handleClear}
                  className="flex flex-col gap-6"
                >
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={contactData.fullName}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    className="bg-white/5 border border-cyan-400/20 px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-400/60 outline-none placeholder-gray-400"
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={contactData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    className="bg-white/5 border border-cyan-400/20 px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-400/60 outline-none placeholder-gray-400"
                  />

                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Your message..."
                    value={contactData.message}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-white/5 border border-cyan-400/20 px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-400/60 outline-none placeholder-gray-400"
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-linear-to-r from-purple-500 to-cyan-500 py-3 rounded-full font-semibold hover:scale-105 transition duration-300 shadow-[0_0_25px_rgba(168,85,247,0.6)] flex items-center justify-center gap-2"
                  >
                    <FiSend />
                    {isLoading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <footer className="bg-[#030712] text-white border-t border-cyan-400/20">
        <div className="border-t border-white/10 text-center py-6 text-gray-500 text-md">
          © {new Date().getFullYear()} HealthUP • All Rights reserved.
        </div>
      </footer>
    </>
  );
};

export default Contact;
