interface StatCardProps {
  label: string;
  value: string | number;
  accent?: string;
}

export const StatCard = ({ label, value, accent }: StatCardProps) => (
  <div className="stat-card">
    <p className="stat-card__label">{label}</p>
    <p className="stat-card__value" style={{ color: accent }}>
      {value}
    </p>
  </div>
);
