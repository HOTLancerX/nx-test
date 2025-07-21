// schema/nx_chat.ts
import { ObjectId } from "mongodb";

export interface NxChatMessage {
  _id?: ObjectId;
  from: ObjectId;        // sender
  to:   ObjectId;        // receiver
  type: "text" | "post" | "page" | "file";
  body: string;          // text or JSON-stringified meta
  fileUrl?: string;      // only when type = file
  seen: boolean;
  createdAt: Date;
}

export interface NxChatRoom {
  _id?: ObjectId;
  participants: [ObjectId, ObjectId]; // sorted array
  lastMessage?: ObjectId;
  updatedAt: Date;
}