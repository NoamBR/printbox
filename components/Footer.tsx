import { Box, Mail, Phone, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-espresso text-brand-onEspressoDim border-t border-brand-line pt-10 lg:pt-12 pb-28 lg:pb-10">
      <div className="max-w-container mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          <div className="text-right">
            <div
              dir="ltr"
              className="flex items-center gap-2.5 font-serif text-2xl text-brand-bone mb-4 justify-end"
            >
              <Box className="size-6 text-brand-gold" />
              <span>
                Print<span className="italic text-brand-gold">Box</span>
              </span>
            </div>
            <p className="text-brand-boneDim leading-relaxed max-w-sm">
              אריזות ממותגות פרימיום לעסקים בישראל.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="https://instagram.com/printbox.il"
                aria-label="אינסטגרם"
                className="w-10 h-10 rounded-md border border-brand-line hover:border-brand-gold hover:text-brand-gold transition-colors flex items-center justify-center"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/printbox-il"
                aria-label="לינקדאין"
                className="w-10 h-10 rounded-md border border-brand-line hover:border-brand-gold hover:text-brand-gold transition-colors flex items-center justify-center"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>

          <nav className="text-right" aria-label="קישורים מהירים">
            <h4 className="text-brand-bone font-semibold mb-5 tracking-wide uppercase text-xs">
              קישורים מהירים
            </h4>
            <ul className="space-y-2.5">
              {[
                ["#products", "מוצרים"],
                ["#", "איך זה עובד"],
                ["#", "שאלות נפוצות"],
                ["/cart", "סל הצעות"],
                ["#", "הצהרת נגישות"],
              ].map(([href, label]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-brand-boneDim hover:text-brand-gold relative inline-block after:content-[''] after:block after:h-px after:w-0 after:bg-brand-gold after:transition-all after:duration-150 hover:after:w-full"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <address className="text-right not-italic">
            <h4 className="text-brand-bone font-semibold mb-5 tracking-wide uppercase text-xs">
              צרו קשר
            </h4>
            <ul className="space-y-3 text-brand-boneDim">
              <li className="flex items-start gap-2 justify-end flex-row-reverse">
                <Mail className="size-4 mt-1 shrink-0 text-brand-gold" />
                <a
                  href="mailto:marketing@print-box.store"
                  className="hover:text-brand-bone"
                  dir="ltr"
                >
                  marketing@print-box.store
                </a>
              </li>
              <li className="flex items-start gap-2 justify-end flex-row-reverse">
                <Phone className="size-4 mt-1 shrink-0 text-brand-gold" />
                <a
                  href="tel:+972-53-306-2022"
                  className="hover:text-brand-bone"
                  dir="ltr"
                >
                  053-306-2022
                </a>
              </li>
              <li className="text-sm text-brand-boneDim/80">
                ימים א&apos;–ה&apos;, ‎09:00–18:00
              </li>
            </ul>
          </address>
        </div>

        <div className="border-t border-brand-line mt-12 pt-6 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs text-brand-boneDim/80">
          <p>© {new Date().getFullYear()} PrintBox. כל הזכויות שמורות.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-brand-gold">מדיניות פרטיות</a>
            <a href="#" className="hover:text-brand-gold">תנאי שימוש</a>
            <a href="#" className="hover:text-brand-gold">הצהרת נגישות</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
