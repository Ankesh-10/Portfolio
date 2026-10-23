import { Buffer } from "@/components/terminal/Buffer";
import { homePage } from "@/lib/pages";

export default function Home() {
  const p = homePage();
  return <Buffer title={p.title} lines={p.lines} />;
}
