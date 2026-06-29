export default function Card({ children, className = "", onClick }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
