import { Buffer } from "@/components/terminal/Buffer";
import { PhoneIntro } from "@/components/visual/PhoneIntro";
import { homePage } from "@/lib/pages";

export default function Home() {
  const p = homePage();
  return (
    <>
      <PhoneIntro />
      <Buffer title={p.title} lines={p.lines} />
    </>
  );
}
