"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
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
    router.push("/");
  };

  if (loading) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-black font-mono">
      <h1 className="text-4xl font-bold mb-4">Error 404</h1>
      <p className="text-sm mb-8">Página no encontrada</p>
      
      {/* Hidden/Subtle logout for usability */}
      <button 
        onClick={handleLogout}
        className="text-xs text-gray-300 hover:text-gray-500 transition-colors"
      >
        Salir
      </button>
    </div>
  );
}
