"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

interface SidebarUser {
  id: string;
  name: string;
  email: string;
}

interface SidebarConversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SidebarProps {
  user: SidebarUser;
  conversations: SidebarConversation[];
}

export function Sidebar({ user, conversations }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const startNewChat = () => {
    setOpen(false);
    router.push("/");
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const initial = (user.name || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-3 left-3 z-40 p-2 rounded-md bg-neutral-200 dark:bg-neutral-800"
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static z-30 md:z-auto inset-y-0 left-0 w-72 shrink-0 bg-neutral-100 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-200`}
      >
        <div className="flex items-center gap-2 px-4 h-14 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={startNewChat}
            className="flex-1 flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium"
          >
            <span className="text-base leading-none">+</span> New chat
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <p className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
              No conversations yet.
            </p>
          ) : (
            conversations.map((conversation) => {
              const active = pathname === `/conversation/${conversation.id}`;
              return (
                <Link
                  key={conversation.id}
                  href={`/conversation/${conversation.id}`}
                  onClick={() => setOpen(false)}
                  className={`block truncate rounded-md px-3 py-2 text-sm ${
                    active
                      ? "bg-neutral-200 dark:bg-neutral-800 font-medium"
                      : "hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70"
                  }`}
                  title={conversation.title ?? "Untitled"}
                >
                  {conversation.title || "New chat"}
                </Link>
              );
            })
          )}
        </nav>

        <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium leading-tight">{user.name}</p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Log out"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}