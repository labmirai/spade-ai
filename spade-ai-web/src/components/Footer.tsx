export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { FOOTER_CONTACTS, FOOTER_LINKS, FOOTER_LOGOS } = require('@/constants');

  return (
    <footer
      className="bg-earth-900 border-t border-earth-700 font-serif"
    >
      <div className="section-container py-16">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* About */}
          <div>
            <p className="text-xs font-sans font-medium uppercase tracking-widest text-earth-500 mb-3">
              Project
            </p>
            <h3
              className="text-lg font-semibold text-white mb-3 tracking-title"
            >
              SPADE-AI
            </h3>
            <p className="text-sm font-sans text-earth-400 leading-relaxed mb-3">
              Deep Learning Based Soil Property Estimation from Smartphone Images
              for Crop Recommendation.
            </p>
            <p className="text-xs font-sans text-earth-500">
              Jashore University of Science and Technology, Bangladesh
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-sans font-medium uppercase tracking-widest text-earth-500 mb-3">
              Quick Links
            </p>
            <div className="flex flex-col gap-0">
              {FOOTER_LINKS.map((link: { label: string; href: string }, i: number, arr: Array<{ label: string; href: string }>) => (
                <a
                  key={i}
                  href={link.href}
                  className={`text-sm font-sans text-earth-400 hover:text-white transition-colors py-2.5 no-underline ${
                    i < arr.length - 1 ? "border-b border-earth-800" : ""
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-sans font-medium uppercase tracking-widest text-earth-500 mb-3">
              Contact
            </p>
            <div className="flex flex-col gap-0">
              {FOOTER_CONTACTS.map((item: { label: string; email: string }, i: number, arr: Array<{ label: string; email: string }>) => (
                <div
                  key={i}
                  className={`flex items-baseline gap-3 py-2.5 ${
                    i < arr.length - 1 ? "border-b border-earth-800" : ""
                  }`}
                >
                  <span className="text-xs font-sans font-medium uppercase tracking-wider text-earth-500 min-w-[36px]">
                    {item.label}
                  </span>
                  <a
                    href={`mailto:${item.email}`}
                    className="text-sm font-sans text-earth-400 hover:text-white transition-colors border-b border-earth-700 pb-px no-underline"
                  >
                    {item.email}
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Funded By */}
        <div className="border-t border-earth-800 pt-10 mb-12">
          <p className="text-xs font-sans font-medium uppercase tracking-widest text-earth-500 mb-8 text-center">
            Funded & Supported By
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {FOOTER_LOGOS.map((logo: { src: string; alt: string }, i: number) => (
              <div
                key={i}
                className="bg-white rounded px-4 py-2 flex items-center justify-center"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-16 md:h-20 object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-earth-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs font-sans text-earth-500">
            &copy; {currentYear} SPADE-AI Research Project. All rights reserved.
          </p>
          <p className="text-xs font-sans text-earth-600">
            Jashore University of Science and Technology, Jashore, Bangladesh
          </p>
        </div>

      </div>
    </footer>
  );
}