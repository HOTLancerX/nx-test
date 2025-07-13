"use client"

import Link from "next/link";
import { useMenu } from "@/lib/useMenu";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface MenuProps {
  location?: string;
  style?: "horizontal" | "vertical";
  className?: string;
}

export default function Menu({ 
  location = "main", 
  style = "horizontal",
  className = ""
}: MenuProps) {
  const { menuItems, loading } = useMenu(location);
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  if (loading) {
    return <div className="flex space-x-4">Loading menu...</div>;
  }

  const renderMenuItems = (items: any[], level = 0) => {
    return items.map((item) => {
      const isActive = pathname === item.url;
      const hasChildren = item.children && item.children.length > 0;
      const menuItemId = `menu-${item.title.toLowerCase().replace(/\s+/g, '-')}-${level}`;

      return (
        <li 
          key={menuItemId}
          className={`relative group ${style === "horizontal" ? "inline-block" : "block"}`}
          onMouseEnter={() => setActiveMenu(menuItemId)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <Link
            href={item.url || "#"}
            className={`px-4 py-2 block ${
              isActive ? "text-blue-600 font-medium" : "text-gray-700 hover:text-blue-600"
            } ${item.className || ""}`}
            target={item.target || "_self"}
          >
            {item.title}
            {hasChildren && (
              <span className="ml-1">
                <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            )}
          </Link>

          {hasChildren && (
            <ul 
              className={`absolute ${
                style === "horizontal" ? "top-full left-0" : "left-full top-0"
              } min-w-[200px] bg-white shadow-lg rounded-md z-50 ${
                activeMenu === menuItemId ? "block" : "hidden"
              } group-hover:block`}
            >
              {renderMenuItems(item.children, level + 1)}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <ul className={`flex ${style === "horizontal" ? "flex-row space-x-2" : "flex-col space-y-2"} ${className}`}>
      {renderMenuItems(menuItems)}
    </ul>
  );
}