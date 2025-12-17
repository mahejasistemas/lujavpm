"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  User, Bell, Search, ChevronRight, 
  LogOut, Settings, LayoutDashboard, 
  Moon, Sun, Laptop, Command
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userJobTitle, setUserJobTitle] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAvatarUrl(user.user_metadata?.avatar_url);
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuario");
        setUserEmail(user.email || "");
        setUserJobTitle(user.user_metadata?.job_title || "Usuario");
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      toast.success("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    
    // Map of segment names to display labels
    const segmentLabels: Record<string, string> = {
      dashboard: "Inicio",
      cotizaciones: "Cotizaciones",
      clientes: "Clientes",
      flota: "Flota",
      rutas: "Rutas",
      correos: "Correos",
      tarifario: "Tarifario",
      reportes: "Reportes",
      configuracion: "Configuración",
      usuarios: "Usuarios",
      nueva: "Nueva",
      editar: "Editar",
      detalle: "Detalle"
    };

    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      const isLast = index === segments.length - 1;
      const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

      return (
        <div key={path} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />}
          <Link 
            href={path}
            className={`text-sm font-medium transition-colors ${
              isLast ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {label}
          </Link>
        </div>
      );
    });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <nav className="flex items-center" aria-label="Breadcrumb">
          {getBreadcrumbs()}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors relative group">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-gray-200 mx-2" />

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-xl transition-all border border-transparent hover:border-gray-200 focus:outline-none"
          >
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-medium text-gray-900">{userName}</span>
              <span className="text-xs text-gray-500">{userJobTitle}</span>
            </div>
            
            <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-gray-200 transition-all">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </button>

          {/* Float Menu */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>

              <div className="p-2">
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/configuracion" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Configuración de Cuenta
                </Link>
              </div>

              <div className="p-2 border-t border-gray-100">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
