import { useState } from "react";
import { FaPlus } from "react-icons/fa";

const FAQS = [
  {
    q: "How does the AI redesign work?",
    a: "Upload a photo, choose a style, and AI transforms your room instantly.",
  },
  {
    q: "How many free designs can I get?",
    a: "Guests get 5 free generations. Register for unlimited designs.",
  },
  {
    q: "What is the Enhance feature?",
    a: "Enhance lets you refine designs using simple text instructions.",
  },
  {
    q: "Can I connect with a real designer?",
    a: "Yes. Browse verified designers and send project inquiries.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6">

        <div className="text-center mb-14">
          <p className="text-purple-600 text-xs font-bold uppercase mb-3">
            FAQ
          </p>

          <h2 className="text-4xl md:text-4xl font-extrabold text-gray-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y border rounded-2xl overflow-hidden">

          {FAQS.map((f, i) => {
            const isOpen = open === i;

            return (
              <div key={i} className="bg-gray-50">

                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-purple-50"
                >
                  <span className="font-semibold text-gray-900">
                    {f.q}
                  </span>

                  <FaPlus
                    className={`transition ${
                      isOpen ? "rotate-45 text-purple-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 text-gray-600 text-sm">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}