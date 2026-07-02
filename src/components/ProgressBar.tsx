export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-wrap" aria-label={`${Math.round(value)}% complete`}>
      <div className="progress-track">
        <span style={{ width: `${Math.min(Math.max(value, 4), 100)}%` }} />
      </div>
    </div>
  );
}
