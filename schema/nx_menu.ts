//schema/nx_menu.ts
import { ObjectId } from "mongodb";

export interface MenuItem {
  _id?: ObjectId;
  title: string;
  url?: string;
  icon?: string;
  type: "post" | "page" | "category" | "custom";
  target?: "_blank" | "_self";
  referenceId?: ObjectId; // For posts, pages, categories
  children?: MenuItem[];
  position: number;
}

export interface NxMenu {
  _id?: ObjectId;
  title: string;
  slug: string;
  location?: "main" | "footer-1" | "footer-2" | "top-bar";
  items: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
}