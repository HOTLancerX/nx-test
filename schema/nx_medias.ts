import { ObjectId } from "mongodb";

export interface NxMedia {
  _id: ObjectId;
  url: string;
  title?: string;
  alt?: string;
  type: 'image' | 'video' | 'document';
  size: number;
  width?: number;
  height?: number;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Input type for creating new media (without _id and userId)
export interface NxMediaInput {
  url: string;
  title?: string;
  alt?: string;
  type: 'image' | 'video' | 'document';
  size: number;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for API input that includes userId
export interface NxMediaCreateInput extends NxMediaInput {
  userId: ObjectId;
}