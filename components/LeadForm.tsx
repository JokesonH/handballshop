"use client";

import { useState } from "react";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea";
  required?: boolean;
};

type Props = {
  /** Formspree form ID from content/site.json. null = not wired up yet. */
  formId: string | null;
  fields: Field[];
  submitLabel: string;
  sentLabel: string;
  errorLabel: string;
  subject?: string;
  compact?: boolean;
};

type State = "idle" | "sending" | "sent" | "error";

const inputCls =
  "w-full border border-ink bg-bone px-3 py-2.5 font-mono text-sm text-ink placeholder:text-graphite focus:bg-paper focus:outline-none";

export default function LeadForm({
  formId,
  fields,
  submitLabel,
  sentLabel,
  errorLabel,
  subject,
  compact = false,
}: Props) {
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formId) return;
    setState("sending");
    try {
      const response = await fetch(`https://formspree.io/f/${formId}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(event.currentTarget),
      });
      setState(response.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="code border border-ink bg-resin px-4 py-3 text-ink">
        ✓ {sentLabel}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "" : "space-y-4"}>
      {subject && <input type="hidden" name="_subject" value={subject} />}

      <div className={compact ? "flex flex-wrap gap-2" : "space-y-4"}>
        {fields.map((field) => (
          <div key={field.name} className={compact ? "min-w-0 flex-1" : ""}>
            {!compact && (
              <label
                htmlFor={field.name}
                className="code mb-1.5 block text-graphite"
              >
                {field.label}
                {field.required && <span className="text-flag"> *</span>}
              </label>
            )}
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                rows={4}
                placeholder={compact ? field.label : undefined}
                className={inputCls}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type ?? "text"}
                required={field.required}
                placeholder={compact ? field.label : undefined}
                aria-label={compact ? field.label : undefined}
                className={inputCls}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={state === "sending" || !formId}
          className="code shrink-0 border border-ink bg-ink px-6 py-3 text-bone transition-colors hover:bg-resin hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state === "sending" ? "…" : submitLabel}
        </button>
      </div>

      {state === "error" && <p className="code text-flag">{errorLabel}</p>}
      {!formId && (
        <p className="code-sm text-graphite">
          {/* Visible so an unwired form is never mistaken for a working one. */}
          FORM NOT CONNECTED — SET FORMSPREE ID IN content/site.json
        </p>
      )}
    </form>
  );
}
