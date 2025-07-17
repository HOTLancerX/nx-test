// schema/product.ts
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