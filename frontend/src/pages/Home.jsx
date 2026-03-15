import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/home/Hero";
import About from "../components/home/About";
import HowItWorks from "../components/home/HowItWorks";
import FAQ from "../components/home/FAQ";
import Contact from "../components/home/Contact";
import Footer from "../components/home/Footer";
import GeneratorModal from "../components/modals/GeneratorModal";

export default function Home() {
  const [showGen, setShowGen] = useState(false);

  return (
    <div className="scroll-smooth">

      <Navbar onOpenGenerator={() => setShowGen(true)} />

      {/* HOME */}
      <section id="home" className="bg-white">
        <Hero onOpen={() => setShowGen(true)} />
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-gray-100">
        <About />
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-purple-200">
        <HowItWorks />
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-gray-100">
        <FAQ />
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-purple-200">
        <Contact />
      </section>

      <Footer />

      {showGen && <GeneratorModal onClose={() => setShowGen(false)} />}
    </div>
  );
}