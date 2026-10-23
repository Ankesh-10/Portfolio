// Shared by the mail form (inline errors) and /api/contact (server-side validation).
export type MailFields = { name: string; email: string; message: string };
export type MailErrors = Partial<Record<keyof MailFields, string>>;

export const LIMITS = { name: 100, email: 200, message: 5000 };

export function validate(f: MailFields): MailErrors {
  const e: MailErrors = {};
  if (!f.name.trim()) e.name = "name can't be empty";
  else if (f.name.length > LIMITS.name) e.name = `name is too long (max ${LIMITS.name})`;
  const email = f.email.trim();
  if (!email.includes("@")) e.email = "email needs an @ — e.g. you@company.com";
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > LIMITS.email)
    e.email = "email doesn't look right — e.g. you@company.com";
  if (!f.message.trim()) e.message = "message can't be empty";
  else if (f.message.length > LIMITS.message)
    e.message = `message is too long (max ${LIMITS.message})`;
  return e;
}

// Draft kept in sessionStorage until sent (spec §7.5).
const DRAFT_KEY = "mail-draft";
export function loadDraft(): MailFields {
  try {
    const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}");
    return { name: d.name ?? "", email: d.email ?? "", message: d.message ?? "" };
  } catch {
    return { name: "", email: "", message: "" };
  }
}
export function saveDraft(f: MailFields) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(f));
  } catch {}
}
export function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {}
}
