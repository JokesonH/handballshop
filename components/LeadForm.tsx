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
  /** Passed through as a hidden field so one inbox can sort by source. */
  subject?: string;
  compact?: boolean;
};

type State = "idle" | "sending" | "sent" | "error";

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
      <p className="border border-nc-court bg-nc-resin-wash px-4 py-3 text-sm font-medium text-nc-court">
        {sentLabel}
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
                className="kicker mb-1.5 block text-nc-slate"
              >
                {field.label}
              </label>
            )}
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                rows={4}
                placeholder={compact ? field.label : undefined}
                className="w-full border border-nc-line bg-white px-3 py-2 text-sm text-nc-ink placeholder:text-nc-mute focus:border-nc-court focus:outline-none"
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type ?? "text"}
                required={field.required}
                placeholder={compact ? field.label : undefined}
                aria-label={compact ? field.label : undefined}
                className="w-full border border-nc-line bg-white px-3 py-2 text-sm text-nc-ink placeholder:text-nc-mute focus:border-nc-court focus:outline-none"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={state === "sending" || !formId}
          className="kicker shrink-0 bg-nc-court px-6 py-3 text-nc-paper transition-colors hover:bg-nc-court-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>

      {state === "error" && (
        <p className="text-sm text-nc-flag">{errorLabel}</p>
      )}
      {!formId && (
        <p className="text-xs text-nc-mute">
          {/* Visible in dev so an unwired form is never mistaken for a working
              one. Set the Formspree ID in content/site.json. */}
          Form not connected — add the Formspree ID in content/site.json.
        </p>
      )}
    </form>
  );
}
