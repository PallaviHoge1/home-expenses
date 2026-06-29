import { useEffect } from "react";
import { X } from "lucide-react";

export default function Sheet({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in ${
        wide ? "w-full max-w-3xl" : "w-full max-w-lg"
      }`}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-5 pb-6">{children}</div>
      </div>
    </div>
  );
}
