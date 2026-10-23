import "server-only";

// GitHub GraphQL (spec §2, §7.3): contributions + language split, fetched at build with daily ISR.
// Returns null on any failure or when GITHUB_TOKEN is unset, and the UI shows the "unavailable" note.
export type GithubStats = {
  firstWeekStart: string; // ISO date of the first week's Sunday
  weeks: number[][]; // contribution counts, 7 per week, oldest → newest
  total: number;
  languages: { name: string; pct: number }[];
};

const LOGIN = "ankesh-10";
const WEEKS = 26;

const query = `query($login:String!){user(login:$login){
  contributionsCollection{contributionCalendar{weeks{firstDay contributionDays{contributionCount}}}}
  repositories(first:100, ownerAffiliations:OWNER, isFork:false, privacy:PUBLIC){nodes{languages(first:5, orderBy:{field:SIZE,direction:DESC}){edges{size node{name}}}}}
}}`;

export async function getGithubStats(): Promise<GithubStats | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login: LOGIN } }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const user = (await res.json())?.data?.user;
    if (!user) return null;

    const all: { firstDay: string; contributionDays: { contributionCount: number }[] }[] =
      user.contributionsCollection.contributionCalendar.weeks;
    const recent = all.slice(-WEEKS);
    const weeks = recent.map((w) => {
      const d = w.contributionDays.map((x) => x.contributionCount);
      while (d.length < 7) d.push(0); // current week is partial
      return d;
    });

    const bytes = new Map<string, number>();
    for (const repo of user.repositories.nodes)
      for (const e of repo.languages.edges)
        bytes.set(e.node.name, (bytes.get(e.node.name) ?? 0) + e.size);
    const sum = [...bytes.values()].reduce((a, b) => a + b, 0);
    const languages = [...bytes.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, n]) => ({ name, pct: Math.round((n / sum) * 100) }));

    return {
      firstWeekStart: recent[0].firstDay,
      weeks,
      total: weeks.flat().reduce((a, b) => a + b, 0),
      languages: sum ? languages : [],
    };
  } catch {
    return null;
  }
}
