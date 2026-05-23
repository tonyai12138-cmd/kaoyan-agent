import { demoDisclaimer } from "../data/mockData";

export default function DisclaimerBanner({ compact = false }) {
  return (
    <div
      className={`notice-banner ${compact ? "text-xs" : "text-sm"}`}
      role="note"
    >
      <span className="notice-dot" />
      <span>{demoDisclaimer}</span>
    </div>
  );
}
