import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/refund-cancellation-policy")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy | Prateek Mayani" },
      {
        name: "description",
        content:
          "Refund and Cancellation Policy for aifworkshop.prateekmayani.com by Prateek Mayani.",
      },
    ],
  }),
  component: RefundCancellationPolicyPage,
});

function RefundCancellationPolicyPage() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      effectiveDate="May 02, 2026"
      version="1.0"
      activePath="/refund-cancellation-policy"
    >
      <section className="space-y-3">
        <p>
          Thank you for choosing the <strong>AI Visual &amp; Reels Creation Masterclass</strong> at <strong>aifworkshop.prateekmayani.com</strong>, operated by <strong>Prateek Mayani</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">1. Live Masterclass Registrations</h2>
        <p>
          Because our masterclass is a live digital event with limited seat capacity and immediate digital resource provisioning, registration fees (₹29) are strictly <strong>non-refundable</strong> once payment is completed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">2. Digital Downloads &amp; Add-On Resources</h2>
        <p>
          Purchases of digital add-on products (such as session recordings, structured notes PDF, or prompt libraries) provide instant digital access to proprietary content and are therefore non-refundable once delivered.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">3. Duplicate Charges</h2>
        <p>
          If you have been charged multiple times for the same transaction due to a network or technical error, please notify us within 7 days of the transaction at <strong>prateekmayani@gmail.com</strong> with your payment receipt. Valid duplicate charges will be refunded to the original payment method via the payment gateway within <strong>5 to 7 business days</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">4. Event Rescheduling or Cancellation</h2>
        <p>
          In the event that a masterclass session is cancelled or rescheduled by the organizer, registered participants will be provided with access to the rescheduled session or alternate access options.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">5. Contact Information</h2>
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
