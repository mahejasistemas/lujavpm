"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  User, Bell, Search, ChevronRight, 
  LogOut, Settings, LayoutDashboard, 
  Moon, Sun, Laptop, Command, Menu,
  ChevronDown, Calendar, AlertTriangle,
  CheckCircle2, Clock, Video,
  Smile, BellOff, Palette, Keyboard, Download, HelpCircle,
  PlusCircle, Briefcase, FileText, Sparkles, Trash2, Pin, ExternalLink,
  Presentation, Layout, Timer, FilePlus, UserPlus, MapPin, Calculator, Truck, Wrench
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
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
    <header className="h-12 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        {/* Workspace Selector */}
        <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-2 py-1.5 rounded-lg transition-colors group">
          <div className="h-5 w-5 rounded bg-[#B80000] flex items-center justify-center text-white text-[10px] font-bold">L</div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Espacio de Trabajo Lujav</span>
          <ChevronDown className="h-3 w-3 text-gray-500" />
        </button>

        <div className="flex items-center gap-3 ml-2 text-gray-400">
          <Calendar className="h-4 w-4 hover:text-gray-600 cursor-pointer" />
          <AlertTriangle className="h-4 w-4 hover:text-gray-600 cursor-pointer text-yellow-500" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="hidden md:flex items-center relative group">
          <Search className="h-4 w-4 absolute left-3 text-gray-400 group-hover:text-[#B80000] transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar" 
            className="h-8 pl-9 pr-12 text-sm bg-gray-50 border-transparent rounded-full focus:ring-1 focus:ring-[#B80000]/20 focus:bg-white w-48 lg:w-64 transition-all hover:bg-gray-100"
          />
          <span className="absolute right-3 text-[10px] text-gray-400 font-medium"></span>
        </div>

        <div className="flex items-center gap-1 mx-2">
           <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Mis Tareas">
             <CheckCircle2 className="h-4.5 w-4.5" />
           </button>
           <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Tiempo">
             <Clock className="h-4.5 w-4.5" />
           </button>
        </div>

        <div className="h-5 w-[1px] bg-gray-200" />

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 p-1 rounded-full transition-all focus:outline-none"
          >
            <div className="relative">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={userName} 
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                 />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium ring-2 ring-white">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
            </div>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>

          {/* Float Menu */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-0 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden text-sm">
              
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                <div className="relative">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={userName} 
                      className="h-10 w-10 rounded-full object-cover"
                     />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                      {userName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{userName}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    <p className="text-xs text-gray-500">En línea</p>
                  </div>
                </div>
              </div>

              {/* Status & Notifications */}
              <div className="p-2 border-b border-gray-100">
                <button className="w-full flex items-center gap-3 px-2 py-2 text-gray-600 rounded hover:bg-gray-100 transition-colors mb-1">
                  <Smile className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400 font-normal">Definir estado</span>
                </button>
                <button className="w-full flex items-center justify-between px-2 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <BellOff className="h-4 w-4 text-gray-500" />
                    <span>Silenciar notificaciones</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {/* Settings Section */}
              <div className="p-2 border-b border-gray-100 space-y-0.5">
                <Link href="/dashboard/configuracion" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-2 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <span>Ajustes de cuenta</span>
                </Link>
                <button className="w-full flex items-center justify-between px-2 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-4 w-4 text-gray-500" />
                    <span>Enviar reporte a mantenimiento</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                </button>
                <button className="w-full flex items-center gap-3 px-2 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                  <HelpCircle className="h-4 w-4 text-gray-500" />
                  <span>Ayuda y Soporte</span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="p-2 border-b border-gray-100">
                <p className="px-2 py-1 text-xs font-medium text-gray-500 mb-1">Acciones Rápidas</p>
                
                <div className="space-y-0.5">
                  <Link href="/dashboard/cotizaciones/nueva" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-between px-2 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <FilePlus className="h-4 w-4 text-gray-500" />
                      <span>Nueva Cotización</span>
                    </div>
                    <Pin className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-500 rotate-45" />
                  </Link>
                  
                  <Link href="/dashboard/clientes/nuevo" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-between px-2 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <UserPlus className="h-4 w-4 text-gray-500" />
                      <span>Registrar Cliente</span>
                    </div>
                    <Pin className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-500 rotate-45" />
                  </Link>

                  <Link href="/dashboard/tarifario" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-between px-2 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Calculator className="h-4 w-4 text-gray-500" />
                      <span>Calculadora de Tarifas</span>
                    </div>
                    <Pin className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-500 rotate-45" />
                  </Link>

                  <Link href="/dashboard/rutas" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-2 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>Ver Rutas Activas</span>
                  </Link>

                  <Link href="/dashboard/flota" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-between px-2 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span>Estado de Flota</span>
                    </div>
                    <Pin className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-500 rotate-45" />
                  </Link>

                  <button className="w-full flex items-center gap-3 px-2 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                    <span>Reportar Incidencia</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-2 bg-gray-50/50">
                <Link href="/dashboard/usuarios" onClick={() => setIsOpen(false)} className="w-full flex items-center gap-3 px-2 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Mi Perfil</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-2 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-gray-500" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
