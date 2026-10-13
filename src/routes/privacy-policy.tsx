import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Prateek Mayani" },
      {
        name: "description",
        content:
          "Privacy Policy for live.prateekmayani.com operated by Prateek Mayani.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      effectiveDate="May 02, 2026"
      version="1.0"
      activePath="/privacy-policy"
    >
      <section className="space-y-3">
        <p>
          <strong>Prateek Mayani</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), operating <strong>live.prateekmayani.com</strong>, is committed to protecting the privacy of its users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or enroll in our educational workshop.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">1. Personal Information We Collect</h2>
        <p>We may collect personal information that you voluntarily provide when registering or making inquiries, including:</p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Full name</li>
          <li>Email address</li>
          <li>Phone / WhatsApp number</li>
          <li>Billing address and transaction details</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">2. Automatically Collected Information</h2>
        <p>When you access our website, we may automatically collect certain device and browsing information, including:</p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>IP address, browser type, and operating system</li>
          <li>Pages visited, time spent, and referring URLs</li>
          <li>Cookies and session identifiers</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">3. How We Use Your Information</h2>
        <p>We use the collected information for purposes including:</p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Processing registrations and delivering workshop joining links</li>
          <li>Sending order confirmations, reminders, and customer support communications</li>
          <li>Improving website performance, usability, and customer experience</li>
          <li>Complying with statutory and legal obligations under Indian law</li>
          <li>Detecting and preventing fraudulent or unauthorized activities</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">4. Data Sharing &amp; Disclosure</h2>
        <p>
          We do not sell your personal information. We may share data only with:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Payment gateway partners (such as Razorpay) for transaction processing</li>
          <li>Communication service providers (for sending transactional emails and WhatsApp notices)</li>
          <li>Government or law enforcement authorities if required by applicable law</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">5. Data Security</h2>
        <p>
          We implement reasonable security practices and procedures in accordance with the Information Technology Act, 2000 and the IT (Reasonable Security Practices) Rules, 2011. All payment transactions are encrypted using industry-standard SSL/TLS technology.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">6. Cookies Policy</h2>
        <p>
          Our website uses cookies to enhance user experience, analyze traffic patterns, and personalize content. You can configure your browser to disable cookies, though certain site features may function with limited efficiency.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">7. Your Rights</h2>
        <p>Under applicable Indian laws, you have the right to access your personal data, request correction of inaccurate records, or request deletion of your information, subject to statutory retention requirements.</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">8. Grievance Officer</h2>
        <p>
          In accordance with the Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020:
        </p>
        <div className="rounded-lg border border-border bg-card/60 p-4 space-y-1 text-[13px] text-muted-foreground">
          <p><strong className="text-foreground">Name:</strong> Prateek Mayani</p>
          <p><strong className="text-foreground">Email:</strong> prateekmayani@gmail.com</p>
          <p><strong className="text-foreground">Address:</strong> Mowa, Daldal Seoni, Raipur (CG), India</p>
          <p className="pt-1 text-[12px]">Grievances will be acknowledged within 48 hours and resolved within 1 month from the date of receipt.</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">9. Contact Us</h2>
        <p>For privacy-related queries, please contact us at:</p>
        <div className="rounded-lg border border-border bg-card/60 p-4 space-y-1 text-[13px] text-muted-foreground">
          <p><strong className="text-foreground">Email:</strong> prateekmayani@gmail.com</p>
          <p><strong className="text-foreground">Phone:</strong> +91 8770500986</p>
          <p><strong className="text-foreground">Address:</strong> Mowa, Daldal Seoni, Raipur (CG), India</p>
        </div>
      </section>
    </LegalLayout>
  );
}
