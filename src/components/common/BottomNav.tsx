"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const menus = [
    {
      label: "홈",
      icon: "🏠",
      href: "/",
    },
    {
      label: "일정",
      icon: "📅",
      href: "/schedule",
    },
    {
      label: "AI",
      icon: "🤖",
      href: "/ai",
    },
    {
      label: "커뮤니티",
      icon: "👥",
      href: "/community",
    },
    {
      label: "프로필",
      icon: "👤",
      href: "/profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-md justify-around py-3">
        {menus.map((menu) => {
          const active = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex flex-col items-center text-xs ${
                active
                  ? "font-bold text-gray-900"
                  : "text-gray-400"
              }`}
            >
              <span className="text-xl">
                {menu.icon}
              </span>

              <span className="mt-1">
                {menu.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}