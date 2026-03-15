import { useState } from "react";
import { FaUser, FaEnvelope, FaCommentDots, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { apiFetch } from "../../services/api.js";

export default function Contact() {
  const [form,    setForm]    = useState({ name:"", email:"", message:"" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const send = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("All fields are required."); return;
    }
    setLoading(true); setSuccess(""); setError("");
    try {
      await apiFetch("/api/contact", { method:"POST", body:JSON.stringify(form) });
      setSuccess("Message sent! We'll get back to you within 24 hours.");
      setForm({ name:"", email:"", message:"" });
    } catch (err) {
      setError(err.message || "Failed to send. Please try again.");
    } finally { setLoading(false); }
  };

  const inp = "pl-10 w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:outline-none transition";

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-start">
        {/* Left */}
        <div>
          <p className="text-purple-600 text-xs font-bold uppercase tracking-widest mb-3">Get in Touch</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
            Have a Project <span className="text-purple-600 italic">in Mind?</span>
          </h2>
          <p className="text-gray-600 mb-10 leading-relaxed">
            Questions about the platform, want to partner as a designer, or just want to say hello — we'd love to hear from you.
          </p>
          <div className="space-y-5">
            {[
              [FaEnvelope,     "Email",    "support@interiorai.in"],
              [FaMapMarkerAlt, "Location", "Tamil Nadu, India"],
              [FaClock,        "Response", "Within 24 hours"],
            ].map(([Icon, label, val]) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                  <Icon className="text-purple-600"/>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="text-gray-800 font-medium text-sm">{val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={send} className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl shadow-purple-100/50 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Send a Message</h3>

          {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl font-medium">{success}</div>}
          {error   && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-medium">{error}</div>}

          <div className="relative">
            <FaUser className="absolute top-3.5 left-3.5 text-purple-400 text-sm"/>
            <input value={form.name} onChange={set("name")} placeholder="Your Name" required className={inp}/>
          </div>
          <div className="relative">
            <FaEnvelope className="absolute top-3.5 left-3.5 text-purple-400 text-sm"/>
            <input type="email" value={form.email} onChange={set("email")} placeholder="Email Address" required className={inp}/>
          </div>
          <div className="relative">
            <FaCommentDots className="absolute top-3.5 left-3.5 text-purple-400 text-sm"/>
            <textarea rows={5} value={form.message} onChange={set("message")} placeholder="Your message..." required
              className={`${inp} resize-none`}/>
          </div>
          <button disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:opacity-90 text-white rounded-xl font-semibold text-sm transition disabled:opacity-60 shadow-lg shadow-purple-200">
            {loading ? "Sending..." : "Send Message →"}
          </button>
        </form>
      </div>
    </section>
  );
}
