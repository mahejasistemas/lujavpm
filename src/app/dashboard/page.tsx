"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Construction, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || "Usuario");
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada correctamente");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#B80000] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-red-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full transform transition-all hover:scale-[1.01]">
          <div className="flex justify-center mb-8">
            <div className="bg-red-50 p-6 rounded-full">
              <Construction className="h-16 w-16 text-[#B80000]" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Hola, <span className="text-[#B80000]">{userEmail?.split('@')[0]}</span>!
          </h2>
          
          <h3 className="text-xl font-medium text-gray-600 mb-6">
            Estamos construyendo tu espacio
          </h3>
          
          <p className="text-gray-500 leading-relaxed mb-8">
            El equipo de desarrollo está trabajando arduamente para traerte las mejores herramientas de cotización y logística.
            <br />
            <span className="text-sm italic mt-2 block opacity-75">Pronto tendrás acceso completo a todas las funcionalidades.</span>
          </p>

          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
            <div className="bg-[#B80000] h-2.5 rounded-full w-[45%] animate-pulse"></div>
          </div>
          <p className="text-xs text-gray-400 text-right mb-6">Progreso del desarrollo: 45%</p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 text-gray-500 hover:text-[#B80000] text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
        
        <footer className="mt-8 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Transportes Lujav. Todos los derechos reservados.
        </footer>
      </main>
    </div>
  );
}
