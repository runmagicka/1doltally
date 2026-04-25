export default function Spinner({ size = 20, className = "" }) {
  return (
    <span
      className={`spinner ${className}`}
      style={{ "--sz": `${size}px` }}
      aria-label="Loading"
    />
  );
}
