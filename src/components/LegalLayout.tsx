import { Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Footer } from "./Footer";

export interface LegalLayoutProps {
  title: string;
  effectiveDate?: string;
  version?: string;
  activePath: string;
  children: ReactNode;
}

const POLICY_LINKS = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us" },
  { name: "Contact Us", href: "/contact-us" },
  { name: "Terms & Conditions", href: "/terms-and-conditions" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Refund & Cancellation Policy", href: "/refund-cancellation-policy" },
  { name: "Shipping Policy", href: "/shipping-policy" },
  { name: "Grievance Redressal", href: "/grievance-redressal" },
];

export function LegalLayout({
  title,
  effectiveDate = "May 02, 2026",
  version = "1.0",
  activePath,
  children,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white flex flex-col justify-between">
      {/* Top Header Bar */}
      <div>
        <header className="border-b border-border/70 bg-card/40 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link to="/" className="font-display text-[17px] font-bold text-foreground hover:text-primary transition-colors">
              Prateek Mayani
            </Link>

            <nav className="flex items-center gap-5 text-[13.5px] font-medium text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <Link
                to="/about-us"
                className={`hover:text-foreground transition-colors ${activePath === "/about-us" ? "text-foreground font-semibold" : ""}`}
              >
                About Us
              </Link>
              <Link
                to="/contact-us"
                className={`hover:text-foreground transition-colors ${activePath === "/contact-us" ? "text-foreground font-semibold" : ""}`}
              >
                Contact Us
              </Link>
            </nav>
          </div>
        </header>

        {/* Secondary Policy Navigation Bar */}
        <div className="border-b border-border/50 bg-secondary/20">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex gap-1 overflow-x-auto py-2.5 text-[13px] scrollbar-none">
              {POLICY_LINKS.map((link) => {
                const isActive =
                  activePath === link.href ||
                  (link.href === "/terms-and-conditions" && activePath === "/terms") ||
                  (link.href === "/refund-cancellation-policy" && activePath === "/refund-policy") ||
                  (link.href === "/shipping-policy" && activePath === "/shipping-delivery-policy");

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
                      isActive
                        ? "bg-card text-foreground font-semibold border border-border/80 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Document Content */}
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="surface border border-border/70 rounded-2xl p-6 sm:p-10 space-y-6">
            <div className="border-b border-border/50 pb-5">
              <h1 className="font-display text-[24px] sm:text-[30px] font-extrabold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-2 text-[12px] text-muted-foreground">
                Effective Date: {effectiveDate} | Version {version}
              </p>
            </div>

            <div className="space-y-6 text-[14px] leading-relaxed text-foreground/90">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Full Legal Footer */}
      <Footer minimal={false} />
    </div>
  );
}
