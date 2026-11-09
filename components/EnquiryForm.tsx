"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

/**
 * Two-step demo enquiry.
 * Answers live only in React state: nothing is sent, stored or written to
 * localStorage, cookies or the URL. A refresh or "Start again" clears them.
 */

export interface ProjectContext {
  slug: string;
  title: string;
}

const projectTypes = ["New build", "Extension", "Renovation", "Not sure yet"] as const;
const budgets = ["Under £100k", "£100k to £250k", "£250k to £500k", "Over £500k", "I'd rather discuss it"];
const timings = ["As soon as possible", "Within 6 months", "In 6 to 12 months", "More than a year away", "Just exploring for now"];

interface Answers {
  projectType: string;
  location: string;
  description: string;
  name: string;
  email: string;
  budget: string;
  timing: string;
}

const empty: Answers = { projectType: "", location: "", description: "", name: "", email: "", budget: "", timing: "" };
type Field = keyof Answers;
type Errors = Partial<Record<Field, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateStep1(a: Answers): Errors {
  const e: Errors = {};
  if (!a.projectType) e.projectType = "Choose the type of project.";
  if (a.location.trim().length < 2) e.location = "Enter an approximate location, such as a town or area.";
  if (a.description.trim().length < 15) e.description = "Tell us a little more about the project: at least 15 characters.";
  else if (a.description.length > 1200) e.description = "Keep the description under 1,200 characters.";
  return e;
}

function validateStep2(a: Answers): Errors {
  const e: Errors = {};
  if (a.name.trim().length < 2) e.name = "Enter your name.";
  if (!a.email.trim()) e.email = "Enter your email address.";
  else if (!EMAIL.test(a.email.trim())) e.email = "Enter an email address in the format name@example.com.";
  return e;
}

const order: Field[] = ["projectType", "location", "description", "name", "email", "budget", "timing"];

export function EnquiryForm({ context, headingLevel = 2 }: { context?: ProjectContext | null; headingLevel?: 2 | 3 }) {
  const [step, setStep] = useState<1 | 2 | "done">(1);
  const [answers, setAnswers] = useState<Answers>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(context ?? null);
  const [announce, setAnnounce] = useState("");
  const uid = useId();
  const fieldRefs = useRef<Partial<Record<Field, HTMLElement | null>>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const H = `h${headingLevel}` as "h2" | "h3";

  useEffect(() => setProjectContext(context ?? null), [context]);

  // Move focus to the step heading whenever the step changes (not on first load).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: "nearest" });
  }, [step]);

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setAnswers((a) => ({ ...a, [field]: value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const fail = (e: Errors) => {
    setErrors(e);
    const first = order.find((f) => e[f]);
    const count = Object.keys(e).length;
    setAnnounce(`${count} ${count === 1 ? "answer needs" : "answers need"} attention.`);
    if (first) fieldRefs.current[first]?.focus();
  };

  const next = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateStep1(answers);
    if (Object.keys(e).length) return fail(e);
    setErrors({});
    setAnnounce("");
    setStep(2);
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateStep2(answers);
    if (Object.keys(e).length) return fail(e);
    setErrors({});
    setAnnounce("");
    setStep("done");
  };

  const reset = () => {
    setAnswers(empty);
    setErrors({});
    setProjectContext(context ?? null);
    setStep(1);
  };

  const id = (f: Field) => `${uid}-${f}`;
  const describedBy = (f: Field, hint = false) => [hint ? `${id(f)}-hint` : "", errors[f] ? `${id(f)}-error` : ""].filter(Boolean).join(" ") || undefined;
  const ErrorText = ({ f }: { f: Field }) =>
    errors[f] ? (
      <p className="field__error" id={`${id(f)}-error`}>
        <span aria-hidden="true">!</span> {errors[f]}
      </p>
    ) : null;

  if (step === "done") {
    const rows: [string, string][] = [
      ...(projectContext ? ([["Project context", `Similar to ${projectContext.title}`]] as [string, string][]) : []),
      ["Project type", answers.projectType],
      ["Approximate location", answers.location],
      ["About the project", answers.description],
      ["Name", answers.name],
      ["Email", answers.email],
      ["Budget range", answers.budget || "Not given"],
      ["Preferred timing", answers.timing || "Not given"],
    ];
    return (
      <div className="enquiry enquiry--done">
        <p className="enquiry__progress">Demo enquiry · complete</p>
        <H className="enquiry__heading" ref={headingRef} tabIndex={-1}>
          Thank you, {answers.name.trim().split(" ")[0]}. Here is your summary.
        </H>
        <p className="demo-note demo-note--strong">
          <strong>Nothing has been sent.</strong> This is a portfolio demo, so your answers exist only on this page. They will disappear when you start
          again or refresh.
        </p>
        <dl className="summary">
          {rows.map(([k, v]) => (
            <div key={k} className="summary__row">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="enquiry__actions">
          <button type="button" className="button button--primary" onClick={reset}>
            Start again
          </button>
          <Link href="/projects/courtyard-house" className="button button--ghost">
            Explore Courtyard House
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="enquiry">
      <ol className="enquiry__steps" aria-label="Enquiry progress">
        <li className={step === 1 ? "is-current" : "is-done"} aria-current={step === 1 ? "step" : undefined}>
          <span aria-hidden="true">01</span> Your project
        </li>
        <li className={step === 2 ? "is-current" : ""} aria-current={step === 2 ? "step" : undefined}>
          <span aria-hidden="true">02</span> Your details
        </li>
      </ol>

      {projectContext && (
        <div className="context-chip">
          <span>
            <span className="context-chip__label">Project context</span> Similar to <strong>{projectContext.title}</strong>
          </span>
          <button type="button" className="context-chip__remove" onClick={() => setProjectContext(null)}>
            Remove<span className="visually-hidden"> project context</span>
          </button>
        </div>
      )}

      <p className="visually-hidden" role="status" aria-live="polite">
        {announce}
      </p>

      {step === 1 ? (
        <form className="enquiry__form" onSubmit={next} noValidate>
          <H className="enquiry__heading" ref={headingRef} tabIndex={-1}>
            Step 1 of 2: your project
          </H>

          <fieldset className={`field ${errors.projectType ? "has-error" : ""}`} aria-describedby={describedBy("projectType")}>
            <legend className="field__label">What kind of project is it?</legend>
            <ErrorText f="projectType" />
            <div className="choice-grid">
              {projectTypes.map((t, i) => (
                <label key={t} className="choice">
                  <input
                    ref={i === 0 ? (el) => void (fieldRefs.current.projectType = el) : undefined}
                    type="radio"
                    name={`${uid}-projectType`}
                    value={t}
                    checked={answers.projectType === t}
                    onChange={set("projectType")}
                    aria-invalid={errors.projectType ? true : undefined}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={`field ${errors.location ? "has-error" : ""}`}>
            <label className="field__label" htmlFor={id("location")}>
              Approximate location
            </label>
            <p className="field__hint" id={`${id("location")}-hint`}>
              A town or area is enough, for example Bearsden or the Southside.
            </p>
            <ErrorText f="location" />
            <input
              ref={(el) => void (fieldRefs.current.location = el)}
              id={id("location")}
              type="text"
              value={answers.location}
              onChange={set("location")}
              aria-invalid={errors.location ? true : undefined}
              aria-describedby={describedBy("location", true)}
              autoComplete="off"
            />
          </div>

          <div className={`field ${errors.description ? "has-error" : ""}`}>
            <label className="field__label" htmlFor={id("description")}>
              Tell us about the project
            </label>
            <p className="field__hint" id={`${id("description")}-hint`}>
              What you would like to build or change, and what matters most to you.
            </p>
            <ErrorText f="description" />
            <textarea
              ref={(el) => void (fieldRefs.current.description = el)}
              id={id("description")}
              rows={5}
              value={answers.description}
              onChange={set("description")}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={describedBy("description", true)}
            />
          </div>

          <p className="demo-note">This is a demo form. Nothing you enter is sent or stored.</p>
          <div className="enquiry__actions">
            <button type="submit" className="button button--primary">
              Continue to your details <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      ) : (
        <form className="enquiry__form" onSubmit={submit} noValidate>
          <H className="enquiry__heading" ref={headingRef} tabIndex={-1}>
            Step 2 of 2: your details
          </H>

          <div className="field-row">
            <div className={`field ${errors.name ? "has-error" : ""}`}>
              <label className="field__label" htmlFor={id("name")}>
                Name
              </label>
              <ErrorText f="name" />
              <input
                ref={(el) => void (fieldRefs.current.name = el)}
                id={id("name")}
                type="text"
                value={answers.name}
                onChange={set("name")}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={describedBy("name")}
                autoComplete="name"
              />
            </div>
            <div className={`field ${errors.email ? "has-error" : ""}`}>
              <label className="field__label" htmlFor={id("email")}>
                Email
              </label>
              <ErrorText f="email" />
              <input
                ref={(el) => void (fieldRefs.current.email = el)}
                id={id("email")}
                type="email"
                inputMode="email"
                value={answers.email}
                onChange={set("email")}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={describedBy("email")}
                autoComplete="email"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field__label" htmlFor={id("budget")}>
                Budget range <span className="field__optional">(optional)</span>
              </label>
              <select id={id("budget")} value={answers.budget} onChange={set("budget")}>
                <option value="">Choose a range</option>
                {budgets.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field__label" htmlFor={id("timing")}>
                Preferred timing <span className="field__optional">(optional)</span>
              </label>
              <select id={id("timing")} value={answers.timing} onChange={set("timing")}>
                <option value="">Choose a timeframe</option>
                {timings.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <p className="demo-note demo-note--strong">
            <strong>Before you submit:</strong> this is a portfolio demo. Your answers will not be sent, emailed or saved. You will just see a summary on
            this page.
          </p>
          <div className="enquiry__actions">
            <button type="button" className="button button--ghost" onClick={() => setStep(1)}>
              <span aria-hidden="true">←</span> Back to your project
            </button>
            <button type="submit" className="button button--primary">
              Submit demo enquiry
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
