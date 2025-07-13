"use client";
import Link from "next/link";
import { useMenu } from "@/lib/useMenu";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface MenuProps {
  location?: string;
  style?: "horizontal" | "vertical";
  className?: string;
}

export default function Menu({
  location = "main",
  style = "horizontal",
  className = "",
}: MenuProps) {
  const { menuItems, loading } = useMenu(location);
  const pathname = usePathname();

  const [hoveredPath, setHoveredPath] = useState<string[]>([]);

  if (loading) return <div>Loading menu...</div>;

  const handleMouseEnter = (path: string[], level: number) => {
    const newPath = [...hoveredPath.slice(0, level), path[level]];
    setHoveredPath(newPath);
  };

  const handleMouseLeave = () => {
    // মেনু থেকে বের হয়ে গেলে সব সাবমেনু গায়েব করো
    setHoveredPath([]);
  };

  const renderMenuLevel = (
    items: any[],
    level: number,
    path: string[] = []
  ) => {
    if (!items || items.length === 0) return null;

    const isTopLevel = level === 0;
    const isHorizontal = style === "horizontal";

    return (
      <ul
        className={`z-50 bg-white shadow-lg rounded min-w-[200px]
          ${isHorizontal
              ? "top-full left-0 absolute"
              : "absolute top-0 left-full"
          }`}
      >
        {items.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          const currentPath = [...path, index.toString()];
          const isActive = pathname === item.url;

          return (
            <li
              key={item.title}
              className="relative group"
              onMouseEnter={() => handleMouseEnter(currentPath, level)}
            >
              <Link
                href={item.url || "#"}
                className={`px-4 py-2 block whitespace-nowrap ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-gray-800 hover:text-blue-600"
                }`}
              >
                {item.title}
              </Link>

              {hoveredPath[level] === currentPath[level] && hasChildren && (
                renderMenuLevel(item.children, level + 1, currentPath)
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="relative inline-block" onMouseLeave={handleMouseLeave}>
      <ul
        className={`${
          style === "horizontal"
            ? "flex flex-row space-x-4"
            : "flex flex-col space-y-2"
        } ${className}`}
      >
        {menuItems.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          const isActive = pathname === item.url;

          return (
            <li
              key={item.title}
              className="relative group"
              onMouseEnter={() => handleMouseEnter([index.toString()], 0)}
            >
              <Link
                href={item.url || "#"}
                className={`px-4 py-2 block whitespace-nowrap ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-gray-800 hover:text-blue-600"
                }`}
              >
                {item.title}
              </Link>

              {hoveredPath[0] === index.toString() && hasChildren && (
                renderMenuLevel(item.children, 1, [index.toString()])
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
