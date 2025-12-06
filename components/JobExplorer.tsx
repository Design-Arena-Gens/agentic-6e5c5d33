"use client";

import { useMemo, useState } from "react";
import { JobWithMeta } from "../lib/jobs";
import { JobCard } from "./JobCard";

interface JobExplorerProps {
  jobs: JobWithMeta[];
  countries: string[];
}

type VisaFilter = "Any" | "Sponsored" | "Not mentioned";

export function JobExplorer({ jobs, countries }: JobExplorerProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [selectedVisa, setSelectedVisa] = useState<VisaFilter>("Any");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (selectedCountry !== "All" && job.country !== selectedCountry) {
        return false;
      }
      if (selectedVisa !== "Any" && job.visa !== selectedVisa) {
        return false;
      }
      if (searchTerm.trim().length > 0) {
        const haystack = `${job.title} ${job.company} ${job.matchReason} ${job.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(searchTerm.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [jobs, selectedCountry, selectedVisa, searchTerm]);

  return (
    <section className="flex flex-1 flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Tailored Filters</h2>
        <p className="mt-1 text-sm text-slate-600">
          Narrow down the most relevant, visa-friendly roles across the UK, Netherlands, Belgium, Ireland, and Italy.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Preferred country
            <select
              value={selectedCountry}
              onChange={(event) => setSelectedCountry(event.target.value)}
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="All">All countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Visa sponsorship
            <select
              value={selectedVisa}
              onChange={(event) => setSelectedVisa(event.target.value as VisaFilter)}
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="Any">Any status</option>
              <option value="Sponsored">Mentioned</option>
              <option value="Not mentioned">Not mentioned</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-2">
            Keyword match
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by role, skill, or company"
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Matched Roles</h2>
        <p className="text-sm text-slate-600">
          Showing{" "}
          <span className="font-semibold text-slate-900">
            {filteredJobs.length} {filteredJobs.length === 1 ? "opportunity" : "opportunities"}
          </span>{" "}
          out of {jobs.length}
        </p>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">No matches yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            Try switching country or visa filters to discover fresh leads that still align with Marwen&apos;s profile.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
