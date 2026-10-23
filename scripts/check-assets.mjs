// Build fails if resume.pdf is missing, so it can never ship broken (spec §13).
import { existsSync } from "node:fs";
if (!existsSync(new URL("../public/resume.pdf", import.meta.url))) {
  console.error("public/resume.pdf is missing");
  process.exit(1);
}
