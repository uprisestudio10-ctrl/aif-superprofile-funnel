import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy | Prateek Mayani" },
      {
        name: "description",
        content:
          "Refund Policy for aifworkshop.prateekmayani.com by Prateek Mayani.",
      },
    ],
  }),
  component: RefundPolicyAliasPage,
});

function RefundPolicyAliasPage() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      effectiveDate="May 02, 2026"
      version="1.0"
      activePath="/refund-policy"
    >
      <section className="space-y-3">
        <p>
          Thank you for choosing the <strong>AI Visual &amp; Reels Creation Masterclass</strong> at <strong>aifworkshop.prateekmayani.com</strong>, operated by <strong>Prateek Mayani</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">1. Live Masterclass Registrations</h2>
        <p>
          Registration fees (₹29) for the live digital masterclass are non-refundable once payment is processed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">2. Duplicate Charges</h2>
        <p>
          If you experienced duplicate payments due to network issues, please email <strong>prateekmayani@gmail.com</strong> with your transaction receipt. Duplicate charges will be refunded to your original payment method via Razorpay within <strong>5 to 7 business days</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">3. Contact Information</h2>
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
