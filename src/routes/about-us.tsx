import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/about-us")({
  head: () => ({
    meta: [
      { title: "About Us | Prateek Mayani" },
      {
        name: "description",
        content:
          "About Prateek Mayani and the AI Visual & Reels Creation Masterclass at live.prateekmayani.com.",
      },
    ],
  }),
  component: AboutUsPage,
});

function AboutUsPage() {
  return (
    <LegalLayout
      title="About Us"
      effectiveDate="May 02, 2026"
      version="1.0"
      activePath="/about-us"
    >
      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">Welcome to Our Platform</h2>
        <p>
          <strong>live.prateekmayani.com</strong> is an online educational initiative led by <strong>Prateek Mayani</strong>, based in <strong>Mowa, Daldal Seoni, Raipur (CG), India</strong>.
        </p>
        <p>
          We provide practical, hands-on training for creators, freelancers, and entrepreneurs looking to master generative artificial intelligence, visual content creation, and modern digital storytelling workflows.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">Our Philosophy</h2>
        <p>
          We focus on accessible, actionable learning. Rather than relying on expensive software subscriptions or complex hardware, our workshops teach efficient, mobile-first methods that enable students to create consistent photorealistic AI character models and creative digital assets with confidence.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[16px] font-bold text-foreground">Contact &amp; Business Information</h2>
        <div className="rounded-lg border border-border bg-card/60 p-4 space-y-1 text-[13px] text-muted-foreground">
          <p><strong className="text-foreground">Name:</strong> Prateek Mayani</p>
          <p><strong className="text-foreground">Email:</strong> prateekmayani@gmail.com</p>
          <p><strong className="text-foreground">Phone:</strong> +91 8770500986</p>
          <p><strong className="text-foreground">Address:</strong> Mowa, Daldal Seoni, Raipur (CG), India</p>
          <p><strong className="text-foreground">Website:</strong> live.prateekmayani.com</p>
        </div>
      </section>
    </LegalLayout>
  );
}
