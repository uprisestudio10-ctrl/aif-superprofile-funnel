import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/grievance-redressal")({
  head: () => ({
    meta: [
      { title: "Grievance Redressal | Prateek Mayani" },
      {
        name: "description",
        content:
          "Grievance Redressal Mechanism for live.prateekmayani.com by Prateek Mayani under Consumer Protection (E-Commerce) Rules, 2020.",
      },
    ],
  }),
  component: GrievanceRedressalPage,
});

function GrievanceRedressalPage() {
  return (
    <LegalLayout
      title="Grievance Redressal Mechanism"
      effectiveDate="May 02, 2026"
      version="1.0"
      activePath="/grievance-redressal"
    >
      <section className="space-y-3">
        <p>
          In accordance with the <strong>Information Technology Act, 2000</strong> and the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, the details of the designated Grievance Officer for <strong>live.prateekmayani.com</strong> are provided below.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">Grievance Officer Details</h2>
        <div className="rounded-lg border border-border bg-card/60 p-4 space-y-1 text-[13px] text-muted-foreground">
          <p><strong className="text-foreground">Name:</strong> Prateek Mayani</p>
          <p><strong className="text-foreground">Designation:</strong> Grievance Officer</p>
          <p><strong className="text-foreground">Address:</strong> Mowa, Daldal Seoni, Raipur (CG), India</p>
          <p><strong className="text-foreground">Email:</strong> prateekmayani@gmail.com</p>
          <p><strong className="text-foreground">Phone:</strong> +91 8770500986</p>
          <p><strong className="text-foreground">Working Hours:</strong> Monday – Saturday, 10:00 AM – 7:00 PM IST</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">Redressal Process &amp; Timelines</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
          <li>
            <strong className="text-foreground">Acknowledgement:</strong> Grievances will be acknowledged within <strong>48 hours</strong> of receipt.
          </li>
          <li>
            <strong className="text-foreground">Resolution:</strong> Complaints will be investigated and resolved within <strong>1 month (30 days)</strong> from the date of receipt.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">Jurisdiction</h2>
        <p>
          Any disputes shall be subject to the exclusive jurisdiction of the competent courts in <strong>Raipur (CG), India</strong>.
        </p>
      </section>
    </LegalLayout>
  );
}
