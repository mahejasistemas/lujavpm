"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  User, Mail, Camera, Loader2, 
  Bell, Lock, Briefcase, Phone, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";


type Tab = "profile" | "security" | "notifications";

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    avatarUrl: "",
    // Extra fields for preservation
    preferredName: "",
    jobTitle: "",
    phone: "",
    location: "",
    timezone: "America/Mexico_City",
    birthDate: "",
  });

  // Password Form Data
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Security Settings (2FA)
  const [twoFactor, setTwoFactor] = useState({
    sms: false,
    authenticator: false
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
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setFormData({
            fullName: user.user_metadata?.full_name || "",
            email: user.email || "",
            avatarUrl: user.user_metadata?.avatar_url || "",
            preferredName: user.user_metadata?.preferred_name || "",
            jobTitle: user.user_metadata?.job_title || "",
            phone: user.user_metadata?.phone || "",
            location: user.user_metadata?.location || "",
            timezone: user.user_metadata?.timezone || "America/Mexico_City",
            birthDate: user.user_metadata?.birth_date || "",
          });
          
          if (user.user_metadata?.notifications) {
            setNotifications(user.user_metadata.notifications);
          }
          if (user.user_metadata?.twoFactor) {
            setTwoFactor(user.user_metadata.twoFactor);
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

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      toast.success('Avatar actualizado correctamente');
      
    } catch (error) {
      console.error('Error al subir avatar:', error);
      toast.error('Error al actualizar el avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error: profileError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          timezone: formData.timezone
        }
      });
      if (profileError) throw profileError;
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    setSaving(true);
    try {
      const updates: any = {
        data: { twoFactor: twoFactor }
      };

      if (passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast.error("Las contraseñas no coinciden");
          setSaving(false);
          return;
        }
        updates.password = passwordData.newPassword;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      
      if (passwordData.newPassword) {
        setPasswordData({ newPassword: "", confirmPassword: "" });
      }
      toast.success("Ajustes de seguridad actualizados");
    } catch (error) {
      console.error("Error al guardar seguridad:", error);
      toast.error("Error al guardar los cambios de seguridad");
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

  // Sidebar Configuration
  const sidebarSections = [
    {
      title: "Mis ajustes",
      items: [
        { id: "profile", label: "Mi Perfil", icon: User },
        { id: "security", label: "Seguridad", icon: Lock },
        { id: "notifications", label: "Notificaciones", icon: Bell },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="mb-6">
               <h1 className="text-xl font-bold text-gray-900">Ajustes</h1>
            </div>
            
            <nav className="space-y-8">
              {sidebarSections.map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                    {section.title}
                  </h3>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as Tab)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          activeTab === item.id
                            ? "text-[#B80000] bg-red-50"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px] p-8">
            
            {activeTab === "profile" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Mi Perfil</h2>
                  <p className="text-sm text-gray-500 mt-1">Gestiona tu información personal</p>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                    <div 
                      className="relative group cursor-pointer"
                      onClick={handleAvatarClick}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                      <div className="h-24 w-24 rounded-full bg-gray-900 text-white flex items-center justify-center text-3xl font-medium overflow-hidden ring-4 ring-gray-50">
                        {formData.avatarUrl ? (
                          <img 
                            src={formData.avatarUrl} 
                            alt="Avatar" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          formData.fullName.substring(0, 2).toUpperCase()
                        )}
                        {uploadingAvatar && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">{formData.fullName || "Usuario"}</h3>
                      <p className="text-gray-500 text-sm">Espacio de Trabajo Lujav</p>
                      <button 
                        onClick={handleAvatarClick}
                        className="mt-2 text-sm text-[#B80000] font-medium hover:text-[#900000]"
                      >
                        Cambiar foto de perfil
                      </button>
                    </div>
                </div>

                <div className="grid gap-6 max-w-xl">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:border-[#B80000] focus:ring-1 focus:ring-[#B80000] outline-none transition-all text-sm"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                      />
                    </div>
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Puesto</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:border-[#B80000] focus:ring-1 focus:ring-[#B80000] outline-none transition-all text-sm"
                        placeholder="Ej. Desarrollador Senior"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Número de teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:border-[#B80000] focus:ring-1 focus:ring-[#B80000] outline-none transition-all text-sm"
                        placeholder="+52 000 000 0000"
                      />
                    </div>
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de nacimiento</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:border-[#B80000] focus:ring-1 focus:ring-[#B80000] outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Seguridad</h2>
                  <p className="text-sm text-gray-500 mt-1">Gestiona tu contraseña y la autenticación de dos factores</p>
                </div>

                <section className="space-y-6 max-w-xl">
                   <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Cambiar contraseña</h3>
                   
                   {/* Password */}
                   <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:border-[#B80000] focus:ring-1 focus:ring-[#B80000] outline-none transition-all text-sm"
                            placeholder="Introduce nueva contraseña"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:border-[#B80000] focus:ring-1 focus:ring-[#B80000] outline-none transition-all text-sm"
                            placeholder="Confirma nueva contraseña"
                          />
                        </div>
                      </div>
                   </div>
                </section>

                <section className="space-y-6 pt-6">
                  <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">Autenticación de dos factores (2FA)</h3>
                  
                  <div className="space-y-6">
                    {/* SMS Toggle */}
                    <div className="flex items-start justify-between">
                      <div className="pr-4">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          Mensaje de texto (SMS)
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Recibe un código de acceso por SMS al iniciar sesión.
                        </p>
                      </div>
                      <button 
                        onClick={() => setTwoFactor(prev => ({ ...prev, sms: !prev.sms }))}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                          twoFactor.sms ? "bg-[#B80000]" : "bg-gray-200"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                          twoFactor.sms ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                    </div>

                    {/* Authenticator App Toggle */}
                    <div className="flex items-start justify-between">
                      <div className="pr-4">
                        <h4 className="text-sm font-medium text-gray-900">Aplicación de autenticación</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Usa una app como Google Authenticator o Authy.
                        </p>
                      </div>
                      <button 
                        onClick={() => setTwoFactor(prev => ({ ...prev, authenticator: !prev.authenticator }))}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                          twoFactor.authenticator ? "bg-[#B80000]" : "bg-gray-200"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                          twoFactor.authenticator ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </section>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveSecurity}
                    disabled={saving}
                    className="px-6 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Notificaciones</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Elige qué notificaciones quieres recibir y cómo.
                        </p>
                    </div>
                    {/* Simplified Notification List */}
                     <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Alertas por correo electrónico</h3>
                                <p className="text-xs text-gray-500 mt-1">Recibe resúmenes semanales y alertas de seguridad.</p>
                            </div>
                            <button 
                                onClick={() => setNotifications(prev => ({ ...prev, emailAlerts: !prev.emailAlerts }))}
                                className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                                notifications.emailAlerts ? "bg-[#B80000]" : "bg-gray-200"
                                )}
                            >
                                <span className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                                notifications.emailAlerts ? "translate-x-6" : "translate-x-1"
                                )} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Notificaciones Push</h3>
                                <p className="text-xs text-gray-500 mt-1">Recibe alertas en tiempo real en tu navegador.</p>
                            </div>
                            <button 
                                onClick={() => setNotifications(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                                className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                                notifications.pushNotifications ? "bg-[#B80000]" : "bg-gray-200"
                                )}
                            >
                                <span className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                                notifications.pushNotifications ? "translate-x-6" : "translate-x-1"
                                )} />
                            </button>
                        </div>
                     </div>
                </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
