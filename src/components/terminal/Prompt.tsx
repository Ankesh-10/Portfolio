/** `$ cmd` — a quiet label above each block. aria-hidden; the section is named by a hidden <h2> (spec §6.4). */
export function Prompt({ cmd, heading }: { cmd: string; heading?: string }) {
  return (
    <>
      {heading && <h2 className="sr-only">{heading}</h2>}
      <div
        aria-hidden
        className="whitespace-pre-wrap break-words text-[length:var(--fs-ui)] leading-6 text-t3"
      >
        <span className="text-t4">$</span> {cmd}
      </div>
    </>
  );
}
