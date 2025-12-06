import { getCountries, getJobs } from "../lib/jobs";
import { JobExplorer } from "../components/JobExplorer";

const PROFILE = {
  name: "Marwen Slimen",
  experience: "1.5+ years",
  skills: [
    "Digital marketing",
    "Content creation",
    "Social media management",
    "Videography",
    "Video editing",
    "Graphic design",
    "WordPress",
    "SEO basics"
  ],
  portfolio: "https://your-portfolio-link-here"
};

export default async function Page() {
  const jobs = getJobs();
  const countries = getCountries();

  return (
    <main className="flex flex-1 flex-col gap-8">
      <section className="rounded-3xl border border-brand-100 bg-gradient-to-br from-white via-slate-50 to-brand-50/40 p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-600">Job Search Assistant</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
          Fresh visa-friendly marketing roles tailored for {PROFILE.name}
        </h1>
        <p className="mt-3 max-w-3xl text-base text-slate-700">
          Focused on securing a full-time, on-site opportunity across the UK, Netherlands, Belgium, Ireland, or Italy with
          potential visa sponsorship. These leads were sourced from LinkedIn within the last 30 days and align with Marwen&apos;s
          creative and digital marketing strengths.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Experience</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{PROFILE.experience}</p>
            <p className="mt-1 text-sm text-slate-600">Creative digital marketing and content execution</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Key strengths</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {PROFILE.skills.slice(0, 4).map((skill) => (
                <li key={skill} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Portfolio</p>
            <a
              href={PROFILE.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              {PROFILE.portfolio}
            </a>
            <p className="mt-1 text-xs text-slate-600">Update with the latest creative campaigns before applying.</p>
          </div>
        </div>
      </section>

      <JobExplorer jobs={jobs} countries={countries} />
    </main>
  );
}
