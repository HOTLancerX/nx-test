// schema/nx_contact.ts
import { ObjectId } from "mongodb";

export interface NxContactField {
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string; // For radio, select, checkbox
  desktopW: string;
  mobileW: string;
}

export interface NxContactForm {
  _id?: ObjectId;
  title: string;
  description?: string; // SunEditor content
  email: string;
  phone: string;
  address: string;
  fields: NxContactField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NxContactSubmission {
  _id?: ObjectId;
  formId: ObjectId;
  formData: Record<string, any>;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  status: "pending" | "completed" | "try again" | "ignore";
  createdAt: Date;
  updatedAt: Date;
}