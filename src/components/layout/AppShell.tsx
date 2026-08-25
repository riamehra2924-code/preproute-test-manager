import type { ReactNode } from "react";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

export function AppShell({
  children,
  breadcrumb,
  actions,
}: {
  children: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar breadcrumb={breadcrumb} actions={actions} />
        <main className="px-4 md:px-8 py-6 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-300">/</span>}
          <span className={i === items.length - 1 ? "text-ink-700 font-medium" : "text-ink-400"}>{item}</span>
        </span>
      ))}
    </nav>
  );
}

function Topbar({
  breadcrumb,
  actions,
}: {
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const notificationStore = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notificationStore.notifications.filter((n) => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initials = user?.userId ? user.userId.slice(0, 2).toUpperCase() : "VB";

  return (
    <div className="border-b border-ink-200 bg-white px-4 md:px-8 py-4 flex items-center justify-between">
      <div>{breadcrumb}</div>

      <div className="flex items-center gap-6">
        {actions && <div>{actions}</div>}

        {/* Notifications Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-ink-600 hover:text-ink-900 transition"
            aria-label="Notifications"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-danger-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-ink-200 z-50 max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-ink-100 p-4 flex justify-between items-center">
                <h3 className="font-semibold text-ink-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      notificationStore.markAllAsRead();
                    }}
                    className="text-xs text-brand-500 hover:text-brand-600 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {notificationStore.notifications.length === 0 ? (
                <div className="p-8 text-center text-ink-400">
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-ink-100">
                  {notificationStore.notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => notificationStore.markAsRead(notif.id)}
                      className={`p-4 cursor-pointer transition ${
                        notif.read ? "bg-white" : "bg-brand-50"
                      } hover:bg-ink-50`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                notif.type === "success"
                                  ? "bg-success-500"
                                  : notif.type === "error"
                                  ? "bg-danger-500"
                                  : notif.type === "warning"
                                  ? "bg-warn-500"
                                  : "bg-brand-500"
                              }`}
                            />
                            <p className="text-sm font-medium text-ink-900">
                              {notif.title}
                            </p>
                          </div>
                          <p className="text-xs text-ink-500 mt-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-ink-400 mt-1.5">
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            notificationStore.removeNotification(notif.id);
                          }}
                          className="text-ink-400 hover:text-danger-500 text-lg leading-none"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 text-sm hover:bg-ink-50 px-3 py-2 rounded-lg transition"
          >
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <div className="text-left">
              <p className="font-medium text-ink-900">VEDANT BOSS</p>
              <p className="text-xs text-ink-400">Admin</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-ink-200 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-ink-900 hover:bg-ink-50 border-t border-ink-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}