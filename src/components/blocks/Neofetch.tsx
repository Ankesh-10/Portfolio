import { profile } from "@/content/profile";
import { projects } from "@/content/projects";
import { certificates } from "@/content/certificates";
import { skills } from "@/content/skills";

// Easter egg (spec §8). Every value is real content, nothing invented.
const ART = [
  "   ▄▄▄▄▄▄▄   ",
  "  █  ▄▄▄  █  ",
  "  █ █   █ █  ",
  "  █ █▀▀▀█ █  ",
  "  █ █   █ █  ",
  "  ▀       ▀  ",
];

export function Neofetch() {
  const user = `${profile.firstName.toLowerCase()}@portfolio`;
  const rows: [string, string][] = [
    ["role", profile.role],
    ["location", profile.location],
    ["status", profile.status],
    ["coding", `since ${profile.since} (${new Date().getFullYear() - profile.since} yrs)`],
    ["stack", skills.flatMap((g) => g.items.slice(0, 1).map((i) => i.name)).join(", ")],
    ["projects", String(projects.length)],
    ["certs", String(certificates.length)],
    ["now", profile.now.label],
  ];
  return (
    <div className="flex flex-wrap gap-x-[3ch]">
      <pre aria-hidden className="m-0 leading-6 text-t1">
        {ART.join("\n")}
      </pre>
      <div>
        <div className="font-bold text-t1">{user}</div>
        <div aria-hidden className="text-t4">
          {"─".repeat(user.length)}
        </div>
        <dl className="m-0">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[10ch_1fr]">
              <dt className="text-t3">{k}</dt>
              <dd className="m-0 text-t2">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
