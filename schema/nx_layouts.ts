// schema/nx_layouts.ts
import { ObjectId } from "mongodb";

export interface LayoutItem {
  id: string;
  type: 'news' | 'banner' | 'content';
  position: number;
  desktopWidth: 'w-full' | 'w-1/2' | 'w-1/3' | 'w-2/3' | 'w-1/4' | 'w-3/4';
  mobileWidth: 'w-full' | 'w-1/2' | 'w-1/3' | 'w-2/3';
  settings: NewsSettings | BannerSettings | ContentSettings;
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

export interface ContentSettings {
  title: string;
  description: string;
  linkTitle: string;
  link: string;
  imageUrl: string;
}

export interface NxLayout {
  _id?: ObjectId;
  title: string;
  status: 'draft' | 'published' | 'archived';
  items: LayoutItem[];
  createdAt: Date;
  updatedAt: Date;
  userId: ObjectId;
}