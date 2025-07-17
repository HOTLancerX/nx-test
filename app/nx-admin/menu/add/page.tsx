"use client";
import MenuForm from "../Form";
import { useRouter } from "next/navigation";

export default function AddMenu() {
  const router = useRouter();

  return (
    <div>
      <MenuForm onSuccess={() => router.push("/nx-admin/menu")} />
    </div>
  );
}