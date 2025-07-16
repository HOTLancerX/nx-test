// schema/nx_layouts.ts
import { ObjectId } from "mongodb";

export interface LayoutItem {
  id: string;
  type: 'news' | 'banner' | 'hero';
  position: number;
  desktopWidth: 'w-full' | 'w-1/2' | 'w-1/3' | 'w-2/3' | 'w-1/4' | 'w-3/4';
  mobileWidth: 'w-full' | 'w-1/2' | 'w-1/3' | 'w-2/3';
  settings: NewsSettings | BannerSettings | HeroSettings;
}

export interface NewsSettings {
  title: string;
  categoryId?: string;
  style: number;
  postLimit: number;
  desktopGrid: number;
  mobileGrid: number;
}

export interface BannerSettings {
  title: string;
  titleStyle: 'text-left' | 'text-center' | 'text-right';
  style: number;
  desktopGrid: number;
  mobileGrid: number;
  items: BannerItem[];
}

export interface BannerItem {
  imageUrl: string;
  title: string;
  description: string;
  link: string;
}

export interface HeroSettings {
  title: string;
  description: string;
  linkTitle: string;
  link: string;
  imageUrl: string;
}

export interface NxLayout {
  _id?: ObjectId;
  title: string;
  desktopWidth: "md:w-full" | "md:w-1/2" | "md:w-1/3" | "md:w-2/3" | "md:w-1/4" | "md:w-3/4"
  status: 'draft' | 'published' | 'archived';
  items: LayoutItem[];
  createdAt: Date;
  updatedAt: Date;
  userId: ObjectId;
}