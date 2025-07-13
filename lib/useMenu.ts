"use client"

import { useState, useEffect } from "react";

export function useMenu(location: string = "main") {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`/api/menu/list?location=${location}`);
        const data = await response.json();
        setMenuItems(data.items || []);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [location]);

  return { menuItems, loading };
}