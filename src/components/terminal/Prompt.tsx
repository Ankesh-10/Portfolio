/** `ankesh@portfolio:~$ cmd` — aria-hidden; the section is named by a hidden <h2> (spec §6.4). */
export function Prompt({ cmd, path, heading }: { cmd: string; path: string; heading?: string }) {
  return (
    <>
      {heading && <h2 className="sr-only">{heading}</h2>}
      <div aria-hidden className="whitespace-pre-wrap break-words text-t2">
        <span className="text-t3">
          <span className="text-t2">ankesh@portfolio</span>:<span className="text-t2">{path}</span>
          <span className="text-t4">$</span>
        </span>{" "}
        {cmd}
      </div>
    </>
  );
}
