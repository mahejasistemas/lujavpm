"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  Truck, 
  FileText, 
  MapPin,
  Box,
  LogOut,
  User,
  Calculator,
  CreditCard,
  FilePlus,
  History,
  Mail,
  DollarSign,
  BarChart,
  UserCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  submenu?: { title: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    title: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Cotizaciones",
    href: "/dashboard/cotizaciones",
    icon: FileText,
  },
  {
    title: "Clientes",
    href: "/dashboard/clientes",
    icon: Users,
  },
  {
    title: "Flota (Camiones)",
    href: "/dashboard/flota",
    icon: Truck,
  },
  {
    title: "Rutas",
    href: "/dashboard/rutas",
    icon: MapPin,
  },
  {
    title: "Correos / Envíos",
    href: "/dashboard/correos",
    icon: Mail,
  },
  {
    title: "Tarifario",
    href: "/dashboard/tarifario",
    icon: DollarSign,
  },
  {
    title: "Reportes",
    href: "/dashboard/reportes",
    icon: BarChart,
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
  },
  {
    title: "Usuarios",
    href: "/dashboard/usuarios",
    icon: UserCog,
    // TODO: Mostrar solo para super usuarios
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isActive = (href: string) => pathname === href;
  const isSubmenuActive = (submenu: { title: string; href: string }[]) => 
    submenu.some(item => pathname === item.href);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-xl font-bold text-[#B80000]">
          Lujav <span className="text-gray-900">Plataforma</span>
        </span>
      </div>

      <div className="flex flex-col justify-between h-[calc(100vh-4rem)]">
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-red-50 hover:text-[#B80000]",
                      isSubmenuActive(item.submenu) || openSubmenus[item.title]
                        ? "text-[#B80000]" 
                        : "text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                    {openSubmenus[item.title] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  {openSubmenus[item.title] && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-red-50 hover:text-[#B80000]",
                            isActive(subItem.href)
                              ? "bg-red-50 text-[#B80000]"
                              : "text-gray-600"
                          )}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-red-50 hover:text-[#B80000]",
                    isActive(item.href!)
                      ? "bg-red-50 text-[#B80000]"
                      : "text-gray-700"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-[#B80000]"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
