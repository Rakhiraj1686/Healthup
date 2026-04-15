import { useEffect } from "react";

export default function Modal({ title, children, onClose }) {

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 mt-10 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-900 p-4 md:p-8 rounded-2xl w-90 md:w-150 max-h-[80vh] overflow-y-scroll no-scrollbar relative border border-gray-700 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute text-red-500 top-4 right-4 hover:text-white text-xl cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-white">
          {title}
        </h2>

        <div className="text-gray-300 whitespace-pre-line leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}