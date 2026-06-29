import { AlertCircle } from "lucide-react";

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Delete" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-red-50 rounded-full">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
