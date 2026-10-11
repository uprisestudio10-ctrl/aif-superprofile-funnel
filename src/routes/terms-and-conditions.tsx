import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions | Prateek Mayani" },
      {
        name: "description",
        content:
          "Terms and Conditions governing the use of aifworkshop.prateekmayani.com by Prateek Mayani.",
      },
    ],
  }),
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
  return (
    <LegalLayout
      title="Terms and Conditions"
      effectiveDate="May 02, 2026"
      version="1.0"
      activePath="/terms-and-conditions"
    >
      <section className="space-y-3">
        <p>
          Welcome to <strong>aifworkshop.prateekmayani.com</strong>. This website is owned and operated by <strong>Prateek Mayani</strong>, located at <strong>Mowa, Daldal Seoni, Raipur (CG), India</strong>. By accessing our website or registering for our workshop, you agree to comply with and be bound by the following Terms and Conditions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">1. Nature of Services</h2>
        <p>
          We provide online educational workshops, digital training programs, and informational resources focused on artificial intelligence content generation. All products and workshops offered are 100% digital.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">2. Registration &amp; Access</h2>
        <p>
          Upon completing registration and payment, access details and joining links for the live workshop will be sent to your registered email address and WhatsApp number. Meeting links are intended solely for the registered individual and must not be shared or redistributed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">3. Payments &amp; Pricing</h2>
        <p>
          All fees are listed in Indian Rupees (INR). Payments are processed through secure third-party payment gateways (Razorpay). By completing a transaction, you confirm that you are authorized to use the chosen payment method.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">4. Intellectual Property</h2>
        <p>
          All workshop materials, presentations, prompts, and content provided by Prateek Mayani are protected under applicable intellectual property laws. You are granted a personal, non-exclusive license to use the knowledge and prompts for your individual projects. Redistribution or commercial resale of the course materials is strictly prohibited.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">5. Disclaimer</h2>
        <p>
          The workshop is for educational and informational purposes only. We make no representations or guarantees regarding specific financial income, audience metrics, or business results. This website and workshop are independent and not affiliated with, sponsored by, or endorsed by Meta, Instagram, Zoom, or third-party AI platforms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">6. Governing Law &amp; Jurisdiction</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in <strong>Raipur (CG), India</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">7. Contact Information</h2>
        <div className="rounded-lg border border-border bg-card/60 p-4 space-y-1 text-[13px] text-muted-foreground">
          <p><strong className="text-foreground">Name:</strong> Prateek Mayani</p>
          <p><strong className="text-foreground">Email:</strong> prateekmayani@gmail.com</p>
          <p><strong className="text-foreground">Phone:</strong> +91 8770500986</p>
          <p><strong className="text-foreground">Address:</strong> Mowa, Daldal Seoni, Raipur (CG), India</p>
        </div>
      </section>
    </LegalLayout>
  );
}
