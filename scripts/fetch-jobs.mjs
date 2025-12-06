import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dayjs from "dayjs";
import { load } from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT, "data", "jobs.json");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};

const SEARCH_CONFIGS = [
  { keywords: "digital marketing executive", location: "United Kingdom", country: "UK", category: "Digital Marketing" },
  { keywords: "social media manager", location: "United Kingdom", country: "UK", category: "Social Media" },
  { keywords: "content creator", location: "United Kingdom", country: "UK", category: "Content Creation" },
  { keywords: "content specialist", location: "Netherlands", country: "Netherlands", category: "Content Creation" },
  { keywords: "digital marketing", location: "Netherlands", country: "Netherlands", category: "Digital Marketing" },
  { keywords: "content creator", location: "Belgium", country: "Belgium", category: "Content Creation" },
  { keywords: "digital marketing", location: "Belgium", country: "Belgium", category: "Digital Marketing" },
  { keywords: "social media manager", location: "Ireland", country: "Ireland", category: "Social Media" },
  { keywords: "digital marketing", location: "Ireland", country: "Ireland", category: "Digital Marketing" },
  { keywords: "videographer", location: "Netherlands", country: "Netherlands", category: "Video Production" },
  { keywords: "videographer", location: "United Kingdom", country: "UK", category: "Video Production" },
  { keywords: "digital marketing", location: "Italy", country: "Italy", category: "Digital Marketing" },
  { keywords: "content creator", location: "Italy", country: "Italy", category: "Content Creation" }
];

const SKILL_KEYWORDS = [
  { label: "Digital Marketing", patterns: [/digital marketing/i, /campaign/i, /performance marketing/i] },
  { label: "Content Creation", patterns: [/content/i, /copywriting/i, /storytelling/i] },
  { label: "Social Media", patterns: [/social media/i, /instagram/i, /tiktok/i, /facebook/i, /community/i] },
  { label: "Video Editing", patterns: [/video/i, /premiere/i, /after effects/i, /filming/i] },
  { label: "Graphic Design", patterns: [/graphic design/i, /photoshop/i, /illustrator/i, /adobe/i] },
  { label: "SEO", patterns: [/seo/i, /search engine/i, /organic search/i] },
  { label: "WordPress", patterns: [/wordpress/i] }
];

async function fetchHTML(url) {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  return response.text();
}

function normalizeUrl(url, defaultDomain) {
  if (!url) return null;
  const decoded = url.replace(/&amp;/g, "&");
  if (decoded.startsWith("http")) {
    return decoded;
  }
  return new URL(decoded, defaultDomain).toString();
}

function extractCountryFromLocation(location) {
  if (!location) return "";
  const tokens = location.split(",").map((t) => t.trim());
  return tokens[tokens.length - 1] || "";
}

function deriveTags(text) {
  const tags = new Set();
  for (const entry of SKILL_KEYWORDS) {
    if (entry.patterns.some((pattern) => pattern.test(text))) {
      tags.add(entry.label);
    }
  }
  return Array.from(tags);
}

function buildMatchReason(title, description, tags, category) {
  const highlights = [];
  if (category && !tags.includes(category)) {
    tags = [...tags, category];
  }

  for (const tag of tags) {
    if (description.toLowerCase().includes(tag.toLowerCase()) || title.toLowerCase().includes(tag.toLowerCase())) {
      highlights.push(tag);
    }
  }

  if (highlights.length === 0) {
    highlights.push("marketing experience");
  }

  return `Mentions ${highlights.slice(0, 3).join(", ")} in responsibilities; aligns with Marwen's ${category || "core"} focus.`;
}

function stripHtml(input) {
  if (!input) return "";
  const $ = load(`<div>${input}</div>`);
  return $("div")
    .text()
    .replace(/\s+/g, " ")
    .trim();
}

function parseRelativeToISO(relativeText) {
  if (!relativeText) return null;
  const lower = relativeText.toLowerCase();

  if (lower.includes("just now") || lower.includes("moments ago")) {
    return dayjs().format("YYYY-MM-DD");
  }
  if (lower.includes("today")) {
    return dayjs().format("YYYY-MM-DD");
  }
  if (lower.includes("yesterday")) {
    return dayjs().subtract(1, "day").format("YYYY-MM-DD");
  }

  const match = lower.match(/(\d+)\s+(second|minute|hour|day|week|month|year)/);
  if (match) {
    const value = Number.parseInt(match[1], 10);
    const unit = match[2];
    return dayjs().subtract(value, unit).format("YYYY-MM-DD");
  }

  if (lower.includes("month")) {
    return dayjs().subtract(1, "month").format("YYYY-MM-DD");
  }
  if (lower.includes("week")) {
    return dayjs().subtract(1, "week").format("YYYY-MM-DD");
  }
  if (lower.includes("day")) {
    return dayjs().subtract(1, "day").format("YYYY-MM-DD");
  }

  return null;
}

async function enrichJob(job) {
  try {
    const html = await fetchHTML(job.link);
    const $ = load(html);
    const ldJsonRaw = $('script[type="application/ld+json"]').first().text();

    let descriptionText = "";
    let detailDate = job.posted;

    if (ldJsonRaw) {
      try {
        const parsed = JSON.parse(ldJsonRaw);
        const descriptionHtml = parsed.description || "";
        descriptionText = stripHtml(descriptionHtml);
        if (parsed.datePosted) {
          detailDate = parsed.datePosted.split("T")[0];
        }
      } catch {
        // ignore invalid JSON
      }
    }

    if (!descriptionText) {
      descriptionText = stripHtml($("main").text());
    }
    descriptionText = descriptionText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    const lower = descriptionText.toLowerCase();
    const mentionsVisa = lower.includes("visa") || lower.includes("sponsorship");
    const tags = deriveTags(`${job.title} ${descriptionText}`);
    const matchReason = buildMatchReason(job.title, descriptionText, tags, job.category);
    let postingDate = detailDate || job.posted;
    const parsedDate = Date.parse(postingDate);
    if (Number.isNaN(parsedDate) || parsedDate > Date.now()) {
      postingDate = job.posted;
    }

    return {
      ...job,
      posted: postingDate,
      visa: mentionsVisa ? "Sponsored" : "Not mentioned",
      tags,
      matchReason,
      descriptionSnippet: descriptionText.slice(0, 260)
    };
  } catch (error) {
    console.warn(`Failed to enrich job ${job.id}: ${error.message}`);
    return {
      ...job,
      visa: "Not mentioned",
      tags: [job.category].filter(Boolean),
      matchReason: `Relevant ${job.category || "marketing"} role sourced from LinkedIn.`
    };
  }
}

async function fetchSearch(config) {
  const params = new URLSearchParams({
    keywords: config.keywords,
    location: config.location,
    start: "0",
    "f_TPR": "r604800" // last 7 days
  });
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?${params.toString()}`;
  const html = await fetchHTML(url);
  const $ = load(html);
  const jobs = [];

  $(".base-search-card").each((_, element) => {
    const card = $(element);
    const anchor = card.find("a.base-card__full-link").first();
    const link = normalizeUrl(anchor.attr("href"), "https://www.linkedin.com");
    const title = card.find("h3.base-search-card__title").text().trim();
    const company = card.find("h4.base-search-card__subtitle a, h4.base-search-card__subtitle").first().text().trim();
    const location = card.find(".job-search-card__location").text().trim();
    const timeElement = card.find("time").first();
    const datetime = timeElement.attr("datetime") || "";
    const relativeLabel = timeElement.text().trim();
    const listingDate = datetime ? datetime.split("T")[0] : new Date().toISOString().split("T")[0];
    const approxDate = parseRelativeToISO(relativeLabel) || listingDate;
    const jobId = card.attr("data-entity-urn")?.split(":").pop() || anchor.attr("href")?.split("-").pop()?.split("?")[0];
    const countryFound = extractCountryFromLocation(location);

    if (!link || !jobId || !title || !company) {
      return;
    }

    if (countryFound && !countryFound.toLowerCase().includes(config.country.toLowerCase())) {
      return;
    }

    const postedWithin30Days = (Date.now() - new Date(approxDate).getTime()) / (1000 * 60 * 60 * 24) <= 30;
    if (!postedWithin30Days) {
      return;
    }

    jobs.push({
      id: `${jobId}`,
      title,
      company,
      location,
      country: config.country,
      link,
      posted: approxDate,
      source: "LinkedIn",
      category: config.category,
      relativeLabel
    });
  });

  return jobs;
}

async function main() {
  const jobMap = new Map();

  for (const config of SEARCH_CONFIGS) {
    try {
      const jobs = await fetchSearch(config);
      for (const job of jobs) {
        if (!jobMap.has(job.id)) {
          jobMap.set(job.id, job);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // politeness delay
    } catch (error) {
      console.warn(`Failed search for ${config.keywords} in ${config.location}: ${error.message}`);
    }
  }

  const enrichedJobs = [];
  for (const job of jobMap.values()) {
    const enriched = await enrichJob(job);
    enrichedJobs.push(enriched);
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  enrichedJobs.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime());

  const grouped = enrichedJobs.reduce((acc, job) => {
    if (!acc[job.country]) {
      acc[job.country] = [];
    }
    acc[job.country].push(job);
    return acc;
  }, {});

  const curated = [];
  for (const country of Object.keys(grouped)) {
    const subset = grouped[country]
      .sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime())
      .slice(0, 8);
    curated.push(...subset);
  }

  curated.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime());

  const minimalJobs = curated.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    country: job.country,
    location: job.location,
    visa: job.visa,
    link: job.link,
    posted: job.posted,
    source: job.source,
    matchReason: job.matchReason,
    tags: job.tags || [],
    descriptionSnippet: job.descriptionSnippet || "",
    relativeLabel: job.relativeLabel || ""
  }));

  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(minimalJobs, null, 2), "utf-8");
  console.log(`Saved ${minimalJobs.length} jobs to ${path.relative(ROOT, DATA_PATH)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
