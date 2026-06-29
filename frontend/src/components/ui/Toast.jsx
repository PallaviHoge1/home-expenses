import { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timeoutsRef.current.get(id);
    if (timer) { clearTimeout(timer); timeoutsRef.current.delete(id); }
  }, []);

  const show = useCallback(({ message, type = "info", duration = 3500, action }) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type, action }]);
    if (duration > 0) {
      const timer = setTimeout(() => dismiss(id), duration);
      timeoutsRef.current.set(id, timer);
    }
    return id;
  }, [dismiss]);

  const api = {
    show, dismiss,
    success: (message, opts = {}) => show({ ...opts, message, type: "success" }),
    error: (message, opts = {}) => show({ ...opts, message, type: "error" }),
    info: (message, opts = {}) => show({ ...opts, message, type: "info" }),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const TYPE_STYLES = {
  success: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon: CheckCircle2, iconColor: "text-emerald-500" },
  error:   { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-800",     icon: AlertCircle,  iconColor: "text-red-500" },
  info:    { bg: "bg-gray-50",    border: "border-gray-200",    text: "text-gray-800",    icon: Info,         iconColor: "text-gray-500" },
};

function ToastViewport({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const s = TYPE_STYLES[t.type] || TYPE_STYLES.info;
        const Icon = s.icon;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-3 py-2.5 rounded-xl border shadow-lg ${s.bg} ${s.border} ${s.text} animate-toast-in`}
            role="status"
          >
            <Icon size={16} className={`${s.iconColor} shrink-0`} />
            <span className="text-sm flex-1 min-w-0">{t.message}</span>
            {t.action && (
              <button
                onClick={() => { t.action.onClick(); dismiss(t.id); }}
                className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-md hover:bg-white/50 ${s.iconColor}`}
              >
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismiss(t.id)} className="p-0.5 rounded-md hover:bg-white/50" aria-label="Dismiss">
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
