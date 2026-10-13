import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy | Prateek Mayani" },
      {
        name: "description",
        content:
          "Shipping & Delivery Policy for digital workshop and educational products on live.prateekmayani.com by Prateek Mayani.",
      },
    ],
  }),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return (
    <LegalLayout
      title="Shipping Policy"
      effectiveDate="May 02, 2026"
      version="1.0"
      activePath="/shipping-policy"
    >
      <section className="space-y-3">
        <p>
          All products, training programs, and workshops offered on <strong>live.prateekmayani.com</strong> by <strong>Prateek Mayani</strong> are <strong>100% digital</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">1. Digital Delivery</h2>
        <p>
          We do not sell or ship physical goods. Consequently, there are no physical shipping charges, courier handling fees, or physical transit delays associated with your purchase.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">2. Delivery Method &amp; Timelines</h2>
        <p>
          Upon successful payment verification, your order confirmation, digital invoice, and workshop joining credentials (Zoom links and access materials) will be delivered electronically via:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Email to your registered email address</li>
          <li>WhatsApp notification to your registered mobile number</li>
        </ul>
        <p className="text-muted-foreground">
          Delivery is typically completed within <strong>5 to 15 minutes</strong> of transaction completion.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">3. Support for Delivery Inquiries</h2>
        <p>
          If you have completed your payment but have not received your access confirmation within 15 minutes, please check your spam folder or contact us at:
        </p>
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
