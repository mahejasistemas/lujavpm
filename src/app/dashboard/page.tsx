import { Construction } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <Construction className="h-24 w-24 text-[#B80000] mb-8" />
      <h1 className="text-4xl font-bold mb-4 text-[#B80000]">Estamos trabajando aquí</h1>
      <p className="text-xl text-gray-600">Pronto regresaremos.</p>
    </div>
  );
}
