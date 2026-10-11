import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact Us | Prateek Mayani" },
      {
        name: "description",
        content:
          "Contact Prateek Mayani for questions regarding workshop registration, access, or support.",
      },
    ],
  }),
  component: ContactUsPage,
});

function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  }

  return (
    <LegalLayout
      title="Contact Us"
      effectiveDate="May 02, 2026"
      version="1.0"
      activePath="/contact-us"
    >
      <section className="space-y-4">
        <p>
          For any inquiries regarding workshop details, registrations, or technical assistance, please reach out to us using the contact details below or by submitting the contact form.
        </p>

        <div className="rounded-lg border border-border bg-card/60 p-5 space-y-2 text-[13.5px] text-muted-foreground">
          <p><strong className="text-foreground">Name:</strong> Prateek Mayani</p>
          <p><strong className="text-foreground">Address:</strong> Mowa, Daldal Seoni, Raipur (CG), India</p>
          <p><strong className="text-foreground">Email:</strong> prateekmayani@gmail.com</p>
          <p><strong className="text-foreground">Phone / WhatsApp:</strong> +91 8770500986</p>
          <p><strong className="text-foreground">Operating Hours:</strong> Monday – Saturday, 10:00 AM – 7:00 PM IST</p>
        </div>
      </section>

      <section className="space-y-4 pt-4 border-t border-border/50">
        <h2 className="font-display text-[16px] font-bold text-foreground">Send a Message</h2>

        {submitted ? (
          <div className="rounded-lg border border-[var(--money)]/40 bg-[var(--money)]/10 p-4 text-[13px] text-foreground">
            Thank you for reaching out, <strong>{name}</strong>. We have received your message and will respond to <strong>{email}</strong> shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 max-w-lg">
            <label className="block">
              <span className="mb-1 block text-[13px] font-medium text-foreground">Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-[13.5px] text-foreground outline-none focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[13px] font-medium text-foreground">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-[13.5px] text-foreground outline-none focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[13px] font-medium text-foreground">Message</span>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-[13.5px] text-foreground outline-none focus:border-primary"
              />
            </label>

            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground hover:opacity-90 transition"
            >
              Submit
            </button>
          </form>
        )}
      </section>
    </LegalLayout>
  );
}
