import { FaUpload, FaMagic } from "react-icons/fa";

export default function Hero({ onOpen }) {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=85)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">

        {/* Heading */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            DecorGen
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl font-semibold text-white mb-4">
          Generate your dream room in seconds.
        </p>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Upload a photo of your room, choose a style or write a custom prompt,
          and let AI transform your space into a stunning new interior design.
        </p>

        {/* CTA */}
        <button
          onClick={onOpen}
          className="flex items-center gap-3 mx-auto bg-gradient-to-r from-purple-600 to-violet-600 
          text-white font-semibold px-8 py-4 rounded-xl shadow-xl
          hover:scale-105 transition"
        >
          <FaUpload />
          Transform My Room
        </button>

      </div>
    </section>
  );
}