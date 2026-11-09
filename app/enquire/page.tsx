import type { Metadata } from "next";
import Link from "next/link";
import { EnquiryForm } from "@/components/EnquiryForm";
import { projects } from "@/content/courtyard-house";

export const metadata: Metadata = {
  title: "Discuss your project",
  description: "A two-step demo enquiry for Formwork Construction, a fictional Glasgow builder. Nothing you enter is sent or stored.",
};

export default async function EnquirePage({ searchParams }: { searchParams: Promise<{ project?: string | string[] }> }) {
  const { project } = await searchParams;
  const slug = Array.isArray(project) ? project[0] : project;
  const match = slug ? projects[slug as keyof typeof projects] : undefined;
  const context = match ? { slug: match.slug, title: match.title } : null;

  return (
    <section className="enquire enquire--page theme-light" aria-labelledby="enquire-page-title">
      <div className="section enquire__grid">
        <header className="section__head enquire__intro">
          <p className="eyebrow">Discuss your project</p>
          <h1 id="enquire-page-title" className="display display--lg">
            {context ? `A project like ${context.title}?` : "Tell us what you have in mind."}
          </h1>
          <p className="section__lede">
            Two short steps: first the project, then how to reach you. {context && <>We have added {context.title} as a reference, and you can remove it.</>}
          </p>
          <p className="demo-note">This is a portfolio demo. The form works, but nothing is sent or saved. You will see a summary of your answers instead.</p>
          {context && (
            <Link href={`/projects/${context.slug}`} className="text-link">
              <span aria-hidden="true">←</span> Back to {context.title}
            </Link>
          )}
        </header>
        <EnquiryForm context={context} />
      </div>
    </section>
  );
}
