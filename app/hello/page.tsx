import Canva from "@/components/Canva";
import Menu from "@/components/Menu";

export default function Page() {
  return (
    <div className="p-8">
      <Canva />
      
      <div className="mb-8">
        <Menu location="main" style="horizontal" className="border-b pb-4" />
      </div>
      
      <div className="mb-8">
        <Menu location="main" style="vertical" className="w-64 border p-4" />
      </div>
    </div>
  );
}