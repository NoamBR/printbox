import { Box, Mail, Phone, MapPin, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-espresso text-brand-cream/90 pt-16 pb-24 lg:pb-12">
      <div className="max-w-container mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          <div className="text-right">
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <Box className="size-6 text-brand-amber" />
              PrintBox
            </div>
            <p className="text-brand-cream/70 leading-relaxed max-w-sm">
              אריזות ממותגות פרימיום לעסקים בישראל. מהרעיון לדלת — תוך 14 ימי
              עסקים.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="https://instagram.com"
                aria-label="אינסטגרם"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-brand-amber transition-colors flex items-center justify-center"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://linkedin.com"
                aria-label="לינקדאין"
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-brand-amber transition-colors flex items-center justify-center"
              >
                <Linkedin className="size-5" />
              </a>
            </div>
          </div>

          <nav className="text-right" aria-label="קישורים מהירים">
            <h4 className="text-white font-bold mb-4">קישורים מהירים</h4>
            <ul className="space-y-2.5">
              {[
                ["#products", "מוצרים"],
                ["#", "איך זה עובד"],
                ["#", "שאלות נפוצות"],
                ["#quote", "צרו קשר"],
                ["#", "הצהרת נגישות"],
              ].map(([href, label]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-brand-cream/75 hover:text-brand-amber relative inline-block after:content-[''] after:block after:h-0.5 after:w-0 after:bg-brand-amber after:transition-all after:duration-150 hover:after:w-full"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <address className="text-right not-italic">
            <h4 className="text-white font-bold mb-4">צרו קשר</h4>
            <ul className="space-y-3 text-brand-cream/80">
              <li className="flex items-start gap-2 justify-end flex-row-reverse">
                <Mail className="size-5 mt-0.5 shrink-0 text-brand-amber" />
                <a href="mailto:hello@printbox.co.il" className="hover:text-white" dir="ltr">
                  hello@printbox.co.il
                </a>
              </li>
              <li className="flex items-start gap-2 justify-end flex-row-reverse">
                <Phone className="size-5 mt-0.5 shrink-0 text-brand-amber" />
                <a href="tel:+97231234567" className="hover:text-white" dir="ltr">
                  03-1234567
                </a>
              </li>
              <li className="flex items-start gap-2 justify-end flex-row-reverse">
                <MapPin className="size-5 mt-0.5 shrink-0 text-brand-amber" />
                <span>רח&apos; היוצרים 12, תל אביב</span>
              </li>
              <li className="text-sm text-brand-cream/60">
                ימים א&apos;–ה&apos;, ‎09:00–18:00
              </li>
            </ul>
          </address>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs text-brand-cream/60">
          <p>© {new Date().getFullYear()} PrintBox. כל הזכויות שמורות.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">מדיניות פרטיות</a>
            <a href="#" className="hover:text-white">תנאי שימוש</a>
            <a href="#" className="hover:text-white">הצהרת נגישות</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
