export default function SkeletonCard() {
  return (
    <div className="idol-card skeleton-card" aria-hidden="true">
      <div className="idol-card-photo skeleton-box" />
      <div className="idol-card-info">
        <div className="skeleton-line" style={{ width: "70%" }} />
        <div className="skeleton-line" style={{ width: "45%" }} />
      </div>
    </div>
  );
}
