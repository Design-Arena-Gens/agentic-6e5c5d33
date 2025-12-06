export type VisaStatus = "Sponsored" | "Not mentioned";

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  country: string;
  location: string;
  visa: VisaStatus;
  link: string;
  posted: string;
  source: string;
  matchReason: string;
  tags: string[];
  descriptionSnippet?: string;
  relativeLabel?: string;
}
