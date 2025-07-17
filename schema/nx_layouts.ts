// schema/nx_layouts.ts
import { ObjectId } from "mongodb";

// Existing types remain unchanged
export interface NewsSettings {
  categoryId: string;
  title: string;
  style: number;
  postLimit: number;
  desktopGrid: number;
  mobileGrid: number;
}

export interface BannerItem {
  imageUrl: string;
  link?: string;
  altText?: string;
}

export interface BannerSettings {
  title: string;
  titleStyle: 'text-left' | 'text-center' | 'text-right';
  style: number;
  desktopGrid: number;
  mobileGrid: number;
  items: BannerItem[];
}

export interface HeroSettings {
  title: string;
  description: string;
  linkTitle: string;
  link: string;
  imageUrl: string;
}

// New Contact Form Field type
export interface ContactField {
  id: number;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string; // For radio, select, checkbox
  desktopWidth: string;
  mobileWidth: string;
}

// New Contact Settings type
export interface ContactSettings {
  _id: string;
  title: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  fields: ContactField[];
}

// Updated LayoutItem type to include contact
export type LayoutItem = {
  id: string;
  type: 'news' | 'banner' | 'hero' | 'contact' | 'product';
  position: number;
  desktopWidth: string;
  mobileWidth: string;
  settings: NewsSettings | BannerSettings | HeroSettings | ContactSettings | ProductSettings;
};

// Existing NxLayout interface remains unchanged
export interface NxLayout {
  _id?: ObjectId;
  title: string;
  items: LayoutItem[];
  createdAt: Date;
  updatedAt: Date;
}


export interface ShippingOption {
  type: 'free' | 'flat' | 'inside_outside';
  note?: string;
  price?: number;
  eta?: string;
  inside_price?: number;
  outside_price?: number;
  inside_area?: string;
}

export interface ProductItem {
  active: boolean;
  title: string;
  color: string;
  image: string;
  regular_price: number;
  sale_price: number;
  currency: string;
  shipping: ShippingOption;
}

export interface ProductSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  products: ProductItem[];
}