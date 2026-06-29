import Card from "./Card";

export default function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-xl font-bold mt-1" style={{ color: color || "#1a1a1a" }}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: (color || "#6366f1") + "12" }}>
            <Icon size={18} style={{ color: color || "#6366f1" }} />
          </div>
        )}
      </div>
    </Card>
  );
}
