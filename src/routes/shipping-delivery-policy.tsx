import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/shipping-delivery-policy")({
  head: () => ({
    meta: [
      { title: "Shipping & Delivery Policy | Prateek Mayani" },
      {
        name: "description",
        content:
          "Shipping & Delivery Policy for aifworkshop.prateekmayani.com by Prateek Mayani.",
      },
    ],
  }),
  component: ShippingDeliveryPolicyAliasPage,
});

function ShippingDeliveryPolicyAliasPage() {
  return (
    <LegalLayout
      title="Shipping Policy"
      effectiveDate="May 02, 2026"
      version="1.0"
      activePath="/shipping-delivery-policy"
    >
      <section className="space-y-3">
        <p>
          All products, training programs, and workshops offered on <strong>aifworkshop.prateekmayani.com</strong> by <strong>Prateek Mayani</strong> are <strong>100% digital</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">1. Digital Delivery</h2>
        <p>
          We do not sell or ship physical goods. Access details and workshop credentials are delivered electronically via email and WhatsApp within 5 to 15 minutes of payment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">2. Contact Information</h2>
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
