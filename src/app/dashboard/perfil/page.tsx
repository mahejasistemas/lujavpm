"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { User as UserIcon, Mail, MapPin, Phone, Building } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/");
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B80000]"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-900"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex items-end -mt-12 mb-6">
            <div className="h-24 w-24 rounded-full bg-white p-1 ring-4 ring-white">
              <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <UserIcon className="h-12 w-12" />
              </div>
            </div>
            <div className="ml-6 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.user_metadata?.full_name || "Usuario Lujav"}
              </h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                    <p>{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p>{user.user_metadata?.phone || "No registrado"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Información de la Cuenta</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rol</p>
                    <p className="capitalize">{user.role || "Usuario"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ubicación</p>
                    <p>{user.user_metadata?.location || "No registrada"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
