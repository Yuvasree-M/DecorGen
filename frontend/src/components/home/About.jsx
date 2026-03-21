import { useState } from "react";
import { FaBrain, FaMagic, FaPalette, FaUserTie } from "react-icons/fa";

const slides = [
  {
    after: "/bedroom.jpg",
    before: "/bedroom_new.jpeg",
  },
  {
    after: "/oldroom.jpg",
    before: "/living_room.jpeg",
  },
  {
    after: "/kitchen.jpg",
    before: "/new_kitchen.jpeg",
  },
];

export default function About() {
  const [index, setIndex] = useState(0);
  const [slider, setSlider] = useState(50);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));

  const current = slides[index];

  return (
    <section id="about" className="py-28">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-purple-600 text-xs font-bold uppercase tracking-widest">
            About DecorGen
          </p>

          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3">
            Transform Any Room <span className=" text-purple-600">With AI Design</span>
           
          </h2>
        </div>

        {/* Main Layout */}
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Before After Slider */}
          <div>

            <div className="relative w-full h-[420px] overflow-hidden rounded-2xl shadow-xl">

              {/* Before */}
              <img
                src={current.before}
                className="absolute w-full h-full object-cover"
              />

              {/* After */}
              <div
                className="absolute top-0 left-0 h-full overflow-hidden"
                style={{ width: `${slider}%` }}
              >
                <img
                  src={current.after}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={slider}
                onChange={(e) => setSlider(e.target.value)}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 w-3/4"
              />

            </div>

            {/* Carousel Buttons */}
            <div className="flex justify-between mt-5">

              <button
                onClick={prev}
                className="px-5 py-2 border rounded-lg hover:bg-white"
              >
                ← Previous
              </button>

              <button
                onClick={next}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Next →
              </button>

            </div>

          </div>

          {/* Content */}
          <div>

            <h3 className="text-2xl font-bold text-gray-900 mb-5">
              AI Powered Interior Design
            </h3>

            <p className="text-gray-600 leading-relaxed mb-8">
              DecorGen uses advanced artificial intelligence to transform
              your existing rooms into stunning modern interiors. Instantly
              explore new furniture, layouts, lighting, and styles before
              spending money on renovations.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6">

              <Feature
                icon={<FaBrain />}
                title="AI Engine"
                desc="Smart AI redesigns rooms instantly"
              />

              <Feature
                icon={<FaPalette />}
                title="Multiple Styles"
                desc="Modern, luxury, minimal & more"
              />

              <Feature
                icon={<FaMagic />}
                title="Instant Results"
                desc="Transform rooms within seconds"
              />

              <Feature
                icon={<FaUserTie />}
                title="Hire Designers"
                desc="Connect with professionals"
              />

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border hover:shadow-md transition">

      <div className="text-purple-600 text-xl">{icon}</div>

      <div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>

    </div>
  );
}