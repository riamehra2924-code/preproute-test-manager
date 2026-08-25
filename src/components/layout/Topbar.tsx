import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Topbar({ breadcrumb, actions }: { breadcrumb?: ReactNode; actions?: ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = (user?.name as string) || (user?.userId as string) || "Admin";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-ink-100">
      <div className="flex items-center justify-between px-4 md:px-8 py-3.5">
        <div className="min-w-0 text-sm text-ink-400">{breadcrumb}</div>
        <div className="flex items-center gap-4 shrink-0">
          {actions}
          <button
            aria-label="Notifications"
            className="relative h-9 w-9 flex items-center justify-center rounded-full border border-ink-100 text-ink-500 hover:bg-ink-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-success-500" />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2.5"
            >
              <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center">
                {initials(displayName)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-ink-900 leading-tight">{displayName}</p>
                <p className="text-xs text-ink-400 leading-tight">Admin</p>
              </div>
              <svg className="h-3.5 w-3.5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border border-ink-100 bg-white shadow-lg py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3.5 py-2 text-sm text-ink-700 hover:bg-ink-50"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
