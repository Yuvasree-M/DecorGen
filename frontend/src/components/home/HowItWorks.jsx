import { FaCamera, FaPalette, FaMagic, FaTools, FaHandshake } from "react-icons/fa";

const steps = [
  { icon: FaCamera, title: "Upload Room", desc: "Upload your room photo" },
  { icon: FaPalette, title: "Choose Style", desc: "Pick your favorite style" },
  { icon: FaMagic, title: "AI Generates", desc: "AI redesigns instantly" },
  { icon: FaTools, title: "Refine Design", desc: "Enhance lighting & layout" },
  { icon: FaHandshake, title: "Hire Designer", desc: "Connect with experts" },
];

export default function HowItWorks() {
  return (
    <section className="py-24">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <p className="text-purple-600 text-xs font-bold tracking-widest uppercase">
            Process
          </p>

          <h2 className="text-4xl font-extrabold text-gray-900 mt-3">
            How It Works
          </h2>

        </div>

        <div className="grid md:grid-cols-5 gap-6">

          {steps.map((s, i) => {
            const Icon = s.icon;

            return (
              <div
                key={i}
                className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg hover:-translate-y-2 transition"
              >

                <Icon className="text-purple-600 text-3xl mx-auto mb-4" />

                <h3 className="font-semibold text-gray-800">{s.title}</h3>

                <p className="text-sm text-gray-500 mt-2">{s.desc}</p>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}