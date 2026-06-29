import { PERSON_COLORS, SPENT_BY } from "../config/categories";

export default function Login({ onLogin }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500 mb-4 shadow-lg shadow-indigo-200">
            <span className="text-white text-2xl font-bold">₹</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Home Expenses</h1>
          <p className="text-sm text-gray-400 mt-1">Who's tracking today?</p>
        </div>

        <div className="flex flex-col gap-3">
          {SPENT_BY.map((name) => {
            const color = PERSON_COLORS[name];
            return (
              <button
                key={name}
                onClick={() => onLogin(name)}
                className="group flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border-2 border-gray-100 hover:shadow-lg transition-all active:scale-[0.99]"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md"
                  style={{ backgroundColor: color }}
                >
                  {name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">{name}</p>
                  <p className="text-xs text-gray-400">Continue as {name}</p>
                </div>
                <svg
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={color} strokeWidth="2"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Your choice is saved locally. Switch anytime from the header.
        </p>
      </div>
    </div>
  );
}
