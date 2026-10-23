"use client";
import { useEffect, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { validate } from "@/lib/mail";
import type { MailErrors, MailFields } from "@/lib/mail";
import { profile } from "@/content/profile";
import { useTerminal } from "./TerminalProvider";

const KEY = "mail-draft";
const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
type Status = "idle" | "sending" | "failed" | "limited" | "offline";
type Field = keyof MailFields;
const ORDER: Field[] = ["name", "email", "message"];

export function loadDraft(): MailFields {
  try {
    const d = JSON.parse(sessionStorage.getItem(KEY) ?? "{}");
    return { name: d.name ?? "", email: d.email ?? "", message: d.message ?? "" };
  } catch {
    return { name: "", email: "", message: "" };
  }
}
export const clearDraft = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
};

/** In-terminal mail form (spec §7.5): real labelled fields styled as prompts, all in the DOM, Tab-reachable. */
export function MailForm() {
  const { closeMail, finishMail, announce } = useTerminal();
  const [f, setF] = useState<MailFields>(loadDraft);
  const [errors, setErrors] = useState<MailErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [frame, setFrame] = useState(0);

  const focus = (k: Field) => document.getElementById(`mail-${k}`)?.focus();

  // Reopening restores the draft with focus in the first empty field.
  useEffect(() => {
    focus(ORDER.find((k) => !f[k].trim()) ?? "message");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "sending") return;
    const still =
      document.documentElement.dataset.motion === "off" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) return;
    const id = setInterval(() => setFrame((n) => (n + 1) % FRAMES.length), 80);
    return () => clearInterval(id);
  }, [status]);

  const set = (k: Field, v: string) => {
    const next = { ...f, [k]: v };
    setF(next);
    setErrors((e) => ({ ...e, [k]: undefined }));
    try {
      sessionStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  // Validate on advancing: show the error under the field, keep the value, return focus to it.
  const advance = (k: Field) => {
    const err = validate(f)[k];
    if (err) {
      setErrors((e) => ({ ...e, [k]: err }));
      focus(k);
      return;
    }
    focus(ORDER[ORDER.indexOf(k) + 1] ?? "message");
  };

  const send = async () => {
    const all = validate(f);
    if (Object.keys(all).length) {
      setErrors(all);
      focus(ORDER.find((k) => all[k])!);
      return;
    }
    if (!navigator.onLine) return setStatus("offline");
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          website:
            (document.getElementById("mail-website") as HTMLInputElement | null)?.value ?? "",
        }),
      });
      if (res.ok) {
        clearDraft();
        announce("Mail sent");
        finishMail("sent ✓ — I'll reply within 2 days");
      } else if (res.status === 429) setStatus("limited");
      else if (res.status === 422) {
        const body = await res.json().catch(() => ({}));
        setErrors(body.errors ?? {});
        setStatus("idle");
      } else setStatus("failed");
    } catch {
      setStatus("failed");
    }
  };

  const onKey = (k: Field) => (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeMail(true);
    } else if (k === "message" && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      send();
    } else if (k !== "message" && e.key === "Enter") {
      e.preventDefault();
      advance(k);
    }
  };

  const busy = status === "sending";
  const row = (k: Field, label: string, input: ReactNode) => (
    <div className="group/f grid grid-cols-[10ch_1fr] items-start gap-x-1 max-md:grid-cols-1">
      <label
        htmlFor={`mail-${k}`}
        className="text-t3 transition-colors group-focus-within/f:text-t1"
      >
        {label}
      </label>
      <div>
        {input}
        {errors[k] && (
          <p id={`mail-${k}-err`} className="m-0 text-t1">
            ! {errors[k]}
          </p>
        )}
      </div>
    </div>
  );
  const common = (k: Field) => ({
    id: `mail-${k}`,
    value: f[k],
    disabled: busy,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `mail-${k}-err` : undefined,
    onChange: (e: { target: { value: string } }) => set(k, e.target.value),
    onKeyDown: onKey(k),
    className:
      "cmd-input w-full min-w-0 bg-transparent text-t1 outline-none focus-visible:outline-none",
  });

  return (
    <form
      data-mail
      aria-label="Send a message"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className="flex max-w-[70ch] flex-col"
    >
      {row(
        "name",
        "name:",
        <input {...(common("name") as object)} type="text" autoComplete="name" />,
      )}
      {row(
        "email",
        "email:",
        <input
          {...(common("email") as object)}
          type="email"
          autoComplete="email"
          inputMode="email"
        />,
      )}
      {row(
        "message",
        "message:",
        <textarea
          {...(common("message") as object)}
          rows={4}
          className={`${common("message").className} resize-none`}
        />,
      )}
      {/* honeypot: real visitors never see or fill it */}
      <input
        id="mail-website"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />
      <div className="mt-1 flex flex-wrap items-center gap-x-4 pl-[11ch] max-md:pl-0">
        <button type="submit" disabled={busy} className="ylink h-8">
          [ send <span aria-hidden>⏎</span> ]
        </button>
        <button type="button" onClick={() => closeMail(true)} className="slink h-8 no-underline">
          [ cancel <span aria-hidden>esc</span> ]
        </button>
        <span className="text-t3 max-md:hidden">⌘/Ctrl+Enter sends</span>
      </div>
      <div className="pl-[11ch] text-t1 max-md:pl-0" role="presentation">
        {status === "sending" && (
          <span>
            <span aria-hidden>{FRAMES[frame]}</span> sending…
          </span>
        )}
        {status === "failed" && (
          <span>
            failed: couldn&apos;t reach the mail server. your message is still here — retry{" "}
            <span aria-hidden>⏎</span> or email{" "}
            <a className="slink" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>{" "}
            directly
          </span>
        )}
        {status === "limited" && <span>too many messages — try email instead</span>}
        {status === "offline" && <span>offline — try again when you&apos;re connected</span>}
      </div>
    </form>
  );
}
