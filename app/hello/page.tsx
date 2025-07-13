import Menu from "@/components/Menu";

export default function Page() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Menu Examples</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Horizontal Menu</h2>
        <Menu location="main" style="horizontal" className="border-b pb-4" />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Vertical Menu</h2>
        <Menu location="main" style="vertical" className="w-64 border p-4" />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Footer Menu</h2>
        <Menu location="footer" style="horizontal" className="bg-gray-100 p-4" />
      </div>
    </div>
  );
}