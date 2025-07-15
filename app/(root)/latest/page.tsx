// app/latest/page.tsx
import { Suspense } from 'react';
import Latest from "@/components/Latest"

export default function LatestPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <Latest />
    </Suspense>
  );
}
