import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function IconOverview(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="11" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  );
}

export function IconDocuments(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M6 3h7l3 3v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M13 3v3h3" />
    </svg>
  );
}

export function IconWorkflow(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M4 6h12M4 10h8M4 14h10" />
      <circle cx="16" cy="10" r="2" />
    </svg>
  );
}

export function IconReport(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M5 3h10v14H5z" />
      <path d="M8 7h4M8 10h4M8 13h2" />
    </svg>
  );
}

export function IconRisks(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M10 3 17 16H3L10 3z" />
      <path d="M10 8v3M10 13h.01" />
    </svg>
  );
}

export function IconChat(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M4 4h12v9H8l-4 3V4z" />
    </svg>
  );
}

export function IconMatters(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M3 6h14M3 10h14M3 14h9" />
    </svg>
  );
}
