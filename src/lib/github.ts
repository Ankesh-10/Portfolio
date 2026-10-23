// GitHub contributions and language split for the skills visual (spec §7.3).
// Fetched at build with ISR (daily). Without GITHUB_TOKEN, or on any failure, returns null and the
// skills visual shows only the skill bars plus `# github stats unavailable right now` (spec §13).
export type GithubStats = {
  /** Last 26 weeks, oldest first; each week is Sun..Sat counts (a partial current week is shorter). */
  weeks: { start: string; days: number[] }[];
  total: number;
  langs: { name: string; pct: number }[];
};

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { date contributionCount } }
      }
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
      nodes { languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name } } } }
    }
  }
}`;

type Resp = {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
        };
      };
      repositories: {
        nodes: { languages: { edges: { size: number; node: { name: string } }[] } }[];
      };
    };
  };
};

export async function githubStats(login: string, weeks = 26): Promise<GithubStats | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const user = ((await res.json()) as Resp).data?.user;
    if (!user) return null;
    const cal = user.contributionsCollection.contributionCalendar.weeks.slice(-weeks).map((w) => ({
      start: w.contributionDays[0]?.date ?? "",
      days: w.contributionDays.map((d) => d.contributionCount),
    }));
    const sizes = new Map<string, number>();
    for (const r of user.repositories.nodes)
      for (const e of r.languages.edges)
        sizes.set(e.node.name, (sizes.get(e.node.name) ?? 0) + e.size);
    const sum = [...sizes.values()].reduce((a, b) => a + b, 0);
    const sorted = [...sizes.entries()].sort((a, b) => b[1] - a[1]);
    // Top 4 languages, the rest folded into "other", so the bar stays readable in greys.
    const top = sorted.slice(0, 4).map(([name, n]) => ({ name, pct: (n / sum) * 100 }));
    const rest = 100 - top.reduce((a, b) => a + b.pct, 0);
    const langs = sum ? (rest >= 1 ? [...top, { name: "other", pct: rest }] : top) : [];
    return { weeks: cal, total: cal.flatMap((w) => w.days).reduce((a, b) => a + b, 0), langs };
  } catch {
    return null;
  }
}
