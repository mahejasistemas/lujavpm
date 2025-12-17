"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  User, Briefcase, Mail, Camera, Save, Loader2, 
  Shield, Bell, Palette, Lock, Smartphone, MapPin, 
  Globe, Moon, Sun, Laptop, Building2, Clock, Phone,
  ChevronRight, Layout, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "profile" | "security" | "notifications" | "appearance";

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    preferredName: "",
    jobTitle: "",
    email: "",
    alternateEmail: "",
    phone: "",
    workPhone: "",
    extension: "",
    location: "",
    officeLocation: "",
    timezone: "",
    bio: "",
    avatarUrl: ""
  });

  // Password Form Data
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Notifications Settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    marketing: false
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        // Debug: List buckets to verify connection and existence
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        console.log("Buckets disponibles:", buckets);
        if (bucketsError) console.error("Error al listar buckets:", bucketsError);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setFormData({
            fullName: user.user_metadata?.full_name || "",
            preferredName: user.user_metadata?.preferred_name || "",
            jobTitle: user.user_metadata?.job_title || "",
            email: user.email || "",
            alternateEmail: user.user_metadata?.alternate_email || "",
            phone: user.user_metadata?.phone || "",
            workPhone: user.user_metadata?.work_phone || "",
            extension: user.user_metadata?.extension || "",
            location: user.user_metadata?.location || "",
            officeLocation: user.user_metadata?.office_location || "",
            timezone: user.user_metadata?.timezone || "",
            bio: user.user_metadata?.bio || "",
            avatarUrl: user.user_metadata?.avatar_url || ""
          });
          
          if (user.user_metadata?.notifications) {
            setNotifications(user.user_metadata.notifications);
          }
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        toast.error("Error al cargar la información del usuario");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('La imagen no debe superar los 2MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No usuario autenticado');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      toast.success('Avatar actualizado correctamente');
      
    } catch (error) {
      const err = error as Error;
      console.error('Error al subir avatar:', err);
      if (err.message?.includes('Bucket not found')) {
        toast.error('Configuración faltante: El bucket "avatars" no existe en Supabase.');
      } else {
        toast.error('Error al actualizar el avatar.');
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          preferred_name: formData.preferredName,
          job_title: formData.jobTitle,
          alternate_email: formData.alternateEmail,
          phone: formData.phone,
          work_phone: formData.workPhone,
          extension: formData.extension,
          location: formData.location,
          office_location: formData.officeLocation,
          timezone: formData.timezone,
          bio: formData.bio,
          avatar_url: formData.avatarUrl
        }
      });

      if (error) throw error;

      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success("Contraseña actualizada correctamente");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      toast.error("Error al actualizar la contraseña");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          notifications: notifications
        }
      });

      if (error) throw error;
      toast.success("Preferencias de notificaciones guardadas");
    } catch (error) {
      console.error("Error al guardar notificaciones:", error);
      toast.error("Error al guardar preferencias");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#B80000]" />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Mi Perfil", description: "Información personal y contacto", icon: User },
    { id: "security", label: "Seguridad", description: "Contraseña y autenticación", icon: Shield },
    { id: "notifications", label: "Notificaciones", description: "Preferencias de alertas", icon: Bell },
    { id: "appearance", label: "Apariencia", description: "Tema y visualización", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuración de Cuenta</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    activeTab === tab.id
                      ? "text-gray-900 font-semibold"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-8">
            {activeTab === "profile" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                
                {/* Avatar Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 flex flex-row items-center gap-6">
                    <div className="relative group cursor-pointer shrink-0" onClick={handleAvatarClick}>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                      <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 relative">
                        {formData.avatarUrl ? (
                          <img 
                            src={formData.avatarUrl} 
                            alt="Profile" 
                            className="h-full w-full object-cover bg-white"
                          />
                        ) : (
                          <span className="text-gray-400 font-bold text-3xl">
                            {formData.fullName?.charAt(0) || "U"}
                          </span>
                        )}
                        {uploadingAvatar && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                        <Camera className="h-8 w-8 text-white drop-shadow-md" />
                      </div>
                    </div>
                    <div className="space-y-1 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Avatar</h3>
                      <p className="text-sm text-gray-500">
                        Este es tu avatar. Haz clic en la imagen para subir uno nuevo.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
                    Un avatar es opcional pero muy recomendado.
                  </div>
                </div>

                {/* Display Name Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Nombre para mostrar</h3>
                      <p className="text-sm text-gray-500">
                        Ingresa tu nombre completo o el nombre con el que te sientas cómodo.
                      </p>
                    </div>
                    <div className="max-w-md">
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm"
                        placeholder="Ej. Transportes Lujav"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-xs text-gray-500">Por favor usa máximo 32 caracteres.</p>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>

                {/* Job Title Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Cargo</h3>
                      <p className="text-sm text-gray-500">
                        Tu puesto o rol dentro de la empresa.
                      </p>
                    </div>
                    <div className="max-w-md">
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm"
                        placeholder="Ej. Gerente de Operaciones"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>

                {/* Office Location Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Oficina / Sucursal</h3>
                      <p className="text-sm text-gray-500">
                        Selecciona la sucursal principal a la que perteneces.
                      </p>
                    </div>
                    <div className="max-w-md relative">
                      <select
                        value={formData.officeLocation}
                        onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                        className="w-full pl-3 pr-10 py-2 rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all text-sm bg-white appearance-none cursor-pointer"
                      >
                        <option value="">Selecciona una sucursal</option>
                        <option value="Veracruz">Veracruz</option>
                        <option value="Altamira">Altamira</option>
                        <option value="Puebla">Puebla</option>
                        <option value="Monterrey">Monterrey</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>

                {/* Email Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Correo Electrónico</h3>
                      <p className="text-sm text-gray-500">
                        Dirección de correo electrónico asociada a tu cuenta.
                      </p>
                    </div>
                    <div className="max-w-md">
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
                    Contacta al administrador para cambiar tu correo.
                  </div>
                </div>

              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                   <h3 className="text-lg font-medium text-gray-900">Seguridad</h3>
                   <p className="text-sm text-gray-500">Gestiona tu contraseña.</p>
                </div>
                <div className="p-6">
                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Nueva Contraseña</label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none text-sm"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1">Confirmar Contraseña</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none text-sm"
                            placeholder="••••••••"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          {saving ? "Actualizando..." : "Actualizar Contraseña"}
                        </button>
                    </form>
                </div>
              </div>
            )}

             {activeTab === "notifications" && (
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Notificaciones</h3>
                        <p className="text-sm text-gray-500">Gestiona tus preferencias de alertas.</p>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Reusing the notification logic but styled simpler */}
                         {[
                        { 
                          id: 'email', 
                          title: 'Alertas por Correo', 
                          desc: 'Recibe notificaciones sobre actividad importante.',
                          state: notifications.emailAlerts,
                          setter: () => setNotifications(prev => ({ ...prev, emailAlerts: !prev.emailAlerts }))
                        },
                        { 
                          id: 'push', 
                          title: 'Notificaciones Push', 
                          desc: 'Recibe alertas en tiempo real en tu navegador.',
                          state: notifications.pushNotifications,
                          setter: () => setNotifications(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))
                        }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="pr-8">
                            <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                           <button 
                            onClick={item.setter}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                              item.state ? "bg-black" : "bg-gray-200"
                            )}
                          >
                            <span className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                              item.state ? "translate-x-6" : "translate-x-1"
                            )} />
                          </button>
                        </div>
                      ))}
                      <div className="pt-4">
                          <button
                          onClick={handleUpdateNotifications}
                          disabled={saving}
                          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          {saving ? "Guardando..." : "Guardar Preferencias"}
                        </button>
                      </div>
                    </div>
                 </div>
             )}

             {activeTab === "appearance" && (
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                     <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Apariencia</h3>
                        <p className="text-sm text-gray-500">Personaliza la interfaz.</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-3 gap-4">
                             <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-black transition-colors">
                                 <Sun className="h-6 w-6 text-gray-900" />
                                 <span className="text-sm font-medium">Claro</span>
                             </div>
                              <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-black transition-colors bg-gray-50">
                                 <Moon className="h-6 w-6 text-gray-900" />
                                 <span className="text-sm font-medium">Oscuro</span>
                             </div>
                        </div>
                    </div>
                 </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
