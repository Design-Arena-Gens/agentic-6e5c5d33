import { JobWithMeta } from "../lib/jobs";

interface JobCardProps {
  job: JobWithMeta;
}

const VisaBadge: React.FC<{ status: JobWithMeta["visa"] }> = ({ status }) => {
  const tones =
    status === "Sponsored"
      ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
      : "bg-amber-100 text-amber-800 ring-amber-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tones}`}
    >
      {status === "Sponsored" ? "Visa sponsorship mentioned" : "Visa sponsorship not mentioned"}
    </span>
  );
};

export function JobCard({ job }: JobCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-300 hover:shadow-md">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{job.country}</p>
            <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
            <p className="text-sm text-slate-700">{job.company}</p>
          </div>
          <VisaBadge status={job.visa} />
        </div>
        <p className="text-sm text-slate-600">{job.location}</p>
      </header>

      <div className="mt-4 space-y-3 text-sm text-slate-700">
        <p>
          <span className="font-medium text-slate-900">Why it fits:&nbsp;</span>
          {job.matchReason}
        </p>
        {job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <div>
          <p className="font-medium text-slate-900">Posted {job.postedRelative}</p>
          <p className="text-xs text-slate-500">Source: {job.source}</p>
        </div>
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Apply Directly
        </a>
      </footer>
    </article>
  );
}
