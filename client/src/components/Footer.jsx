import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
  FaLeaf,
  FaHome,
  FaBox,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaInfoCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

function Footer() {
  // Quick navigation links configuration
  const quickLinks = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "Products", path: "/products", icon: <FaBox /> },
    { name: "Events", path: "/events", icon: <FaCalendarAlt /> },
    { name: "Workshops", path: "/workshops", icon: <FaChalkboardTeacher /> },
    { name: "About Us", path: "/about", icon: <FaInfoCircle /> },
  ];

  // Social media links configuration
  const socialLinks = [
    { icon: <FaFacebookF />, url: "https://facebook.com" },
    { icon: <FaInstagram />, url: "https://instagram.com" },
    { icon: <FaTwitter />, url: "https://twitter.com" },
    { icon: <FaLinkedinIn />, url: "https://linkedin.com" },
    { icon: <FaYoutube />, url: "https://youtube.com" },
    { icon: <FaTiktok />, url: "https://tiktok.com" },
  ];

  return (
    <footer className="bg-ecoCream dark:bg-gray-900 text-black dark:text-gray-300 px-6 md:px-16 py-16 mt-20 border-t border-gray-300 dark:border-gray-800 shadow-inner transition-colors duration-300">
      {/* Main Footer Grid - 4 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand Section */}
        <div>
          {/* Logo and Brand Name */}
          <div className="flex items-center gap-2 mb-3">
            <img
              src="/Images/logo.png"
              alt="Urban Harvest Hub Logo"
              className="h-10 w-10 transition-transform duration-300 hover:scale-110 brightness-50 dark:brightness-100"
            />
            <h2 className="font-ecoHeading text-2xl text-black dark:text-white">
              Urban Harvest Hub
            </h2>
          </div>

          {/* Brand Description */}
          <p className="text-sm text-black/80 dark:text-gray-400 leading-relaxed">
            Your trusted community hub for eco-friendly products, sustainable
            workshops, and green lifestyle events. Together, we grow.
          </p>

          {/* Social Media Icons */}
          <div className="flex gap-4 mt-5">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black dark:text-gray-400 text-xl hover:text-ecoGreen dark:hover:text-ecoLight transition hover:scale-110 animate-jump"
                aria-label="Social media link"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Contact Information Section */}
        <div>
          <h3 className="font-ecoHeading text-xl mb-4 text-black dark:text-white">Contact Us</h3>

          {/* Phone */}
          <div className="flex items-center gap-3 text-sm text-black/80 dark:text-gray-400 mb-2">
            <FaPhoneAlt className="text-ecoGreen dark:text-ecoLight animate-jump" />
            +94 77 465 8932
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 text-sm text-black/80 dark:text-gray-400 mb-2">
            <FaEnvelope className="text-ecoGreen dark:text-ecoLight animate-jump" />
            support@urbanharvesthub.lk
          </div>

          {/* Address */}
          <div className="flex items-center gap-3 text-sm text-black/80 dark:text-gray-400 mb-2">
            <FaMapMarkerAlt className="text-ecoGreen dark:text-ecoLight animate-jump" />
            No. 12, Eco Street, Colombo, Sri Lanka
          </div>

          {/* Business Hours */}
          <div className="flex items-center gap-3 text-sm text-black/80 dark:text-gray-400">
            <FaClock className="text-ecoGreen dark:text-ecoLight animate-jump" />
            Mon - Fri: 9:00 AM – 6:00 PM
          </div>
        </div>

        {/* Quick Access Links Section */}
        <div>
          <h3 className="font-ecoHeading text-xl mb-4 text-black dark:text-white">Quick Access</h3>

          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.path}
                  className="group flex items-center gap-3 text-sm text-black/80 dark:text-gray-400 hover:text-ecoGreen dark:hover:text-ecoLight transition-all duration-300 hover:translate-x-3 hover:scale-105"
                >
                  <span className="text-lg animate-jump group-hover:translate-x-2 transition-transform duration-300">{link.icon}</span>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter Subscription Section */}
        <div>
          <h3 className="font-ecoHeading text-xl mb-4 text-black dark:text-white">Newsletter</h3>
          <p className="text-sm text-black/80 dark:text-gray-400 mb-3">
            Stay updated on eco events, new arrivals & exclusive offers!
          </p>

          {/* Email Input */}
          <input
            type="email"
            placeholder="Your email"
            className="w-full p-3 rounded-lg border border-ecoGreen/40 dark:border-gray-700 
                       text-sm focus:ring-2 focus:ring-ecoGreen outline-none mb-3
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            aria-label="Email for newsletter"
          />

          {/* Submit Button */}
          <button
            className="w-full bg-ecoGreen text-white py-3 rounded-lg 
                       hover:bg-ecoDark transition hover:scale-105 shadow-md"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Divider Line */}
      <div className="border-t border-gray-400 dark:border-gray-700 mt-12 pt-4"></div>

      {/* Copyright Notice */}
      <p className="text-center text-sm text-black/70 dark:text-gray-500">
        © {new Date().getFullYear()} Urban Harvest Hub | Created By Vidma Jayani | All Rights Reserved
      </p>
    </footer >
  );
}

export default Footer;