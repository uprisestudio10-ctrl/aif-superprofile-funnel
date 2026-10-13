import { Link } from "@tanstack/react-router";

interface FooterProps {
  /**
   * If true, displays the clean minimal footer with only Privacy Policy and Terms (like on the main landing page).
   * If false, displays the complete legal navigation footer.
   */
  minimal?: boolean;
}

export function Footer({ minimal = false }: FooterProps) {
  if (minimal) {
    return (
      <footer className="border-t border-border/60 bg-black/40 pt-8 pb-28 sm:pb-20 text-center text-[12px] text-muted-foreground">
        <div className="mx-auto max-w-4xl px-4 space-y-4">
          <div className="flex items-center justify-center gap-4 text-[13px] font-medium text-foreground/80">
            <Link to="/privacy-policy" className="transition hover:text-primary underline">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground/40">|</span>
            <Link to="/terms-and-conditions" className="transition hover:text-primary underline">
              Terms &amp; Conditions
            </Link>
          </div>

          <div className="text-[11px] leading-relaxed text-muted-foreground/70 max-w-2xl mx-auto">
            <p>
              This site is not a part of the Facebook / Meta website or Meta Inc. Additionally, this site is NOT endorsed by Meta in any way.
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} Prateek Mayani. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border/60 bg-black/50 pt-10 pb-16 text-muted-foreground">
      <div className="mx-auto max-w-4xl px-4">
        {/* Navigation links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[13px] font-medium text-foreground/80">
          <Link to="/" className="transition hover:text-primary">
            Home
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link to="/about-us" className="transition hover:text-primary">
            About Us
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link to="/contact-us" className="transition hover:text-primary">
            Contact Us
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link to="/terms-and-conditions" className="transition hover:text-primary">
            Terms &amp; Conditions
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link to="/privacy-policy" className="transition hover:text-primary">
            Privacy Policy
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link to="/refund-cancellation-policy" className="transition hover:text-primary">
            Refund &amp; Cancellation Policy
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link to="/shipping-policy" className="transition hover:text-primary">
            Shipping Policy
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link to="/grievance-redressal" className="transition hover:text-primary">
            Grievance Redressal
          </Link>
        </div>

        {/* Business details */}
        <div className="mt-8 border-t border-border/40 pt-6 text-center text-[12px] leading-relaxed text-muted-foreground/80 space-y-1.5">
          <p className="font-semibold text-foreground/90">Prateek Mayani</p>
          <p>Mowa, Daldal Seoni, Raipur (CG), India</p>
          <p>Email: prateekmayani@gmail.com | Phone: +91 8770500986</p>
          <p className="pt-2 text-[11px] text-muted-foreground/60">
            © {new Date().getFullYear()} Prateek Mayani (live.prateekmayani.com). All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
