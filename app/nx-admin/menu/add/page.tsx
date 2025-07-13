"use client";
import MenuForm from "../Form";
import { useRouter } from "next/navigation";

export default function AddMenu() {
  const router = useRouter();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <MenuForm onSuccess={() => router.push("/nx-admin/menu")} />
    </div>
  );
}