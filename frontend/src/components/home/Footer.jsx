import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-14 pb-8">

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-3 gap-10 pb-10 border-b border-gray-800">

          {/* Logo */}
          <div>

            <h2 className="text-xl font-extrabold mb-4">
              Decor<span className="text-purple-400">Gen</span>
            </h2>

            <p className="text-gray-400 text-sm mb-5">
              Transforming rooms with AI and connecting you with India's best designers.
            </p>

            <div className="flex gap-3">

              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map(
                (Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-purple-600 flex items-center justify-center"
                  >
                    <Icon size={14} />
                  </a>
                )
              )}

            </div>

          </div>

          {/* Links */}
          <div>

            <h3 className="text-purple-400 text-xs uppercase mb-4">
              Quick Links
            </h3>

            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>

          </div>

          {/* Contact */}
          <div>

            <h3 className="text-purple-400 text-xs uppercase mb-4">
              Contact
            </h3>

            <p className="text-gray-400 text-sm">
              support@decorgen.in
            </p>

            <p className="text-gray-400 text-sm">
             Tamil Nadu, India
            </p>

          </div>

        </div>

        <div className="pt-7 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} DecorGen. All rights reserved.
        </div>

      </div>

    </footer>
  );
}