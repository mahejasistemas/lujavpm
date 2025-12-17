"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import "./login.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "Invalid login credentials":
        return "Credenciales incorrectas. Por favor, verifica tu correo y contraseña.";
      case "User already registered":
        return "El usuario ya está registrado. Intenta iniciar sesión.";
      case "Password should be at least 6 characters":
        return "La contraseña debe tener al menos 6 caracteres.";
      case "Email not confirmed":
        return "Correo electrónico no confirmado. Revisa tu bandeja de entrada.";
      default:
        return error;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Inicio de sesión exitoso", {
          description: "Bienvenido a la plataforma.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (error) throw error;
        toast.success("Registro exitoso", {
          description: "Revisa tu correo para confirmar tu cuenta.",
        });
      }
    } catch (err: any) {
      const message = getErrorMessage(err.message);
      setError(message);
      toast.error("Error de autenticación", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      });
      if (error) throw error;
    } catch (err: any) {
      const message = getErrorMessage(err.message);
      setError(message);
      toast.error("Error de autenticación social", {
        description: message,
      });
    }
  };

  return (
    <div className="login-wrapper">
      {/* Left Side - Editorial/Branding (No Logo) */}
      <div className="brand-section">
        <div className="brand-content">
          <h1 className="brand-title">
            Transportes Lujav <br />
            <span style={{ opacity: 0.5 }}>Sistema de Cotizaciones.</span>
          </h1>
          <p className="brand-description">
            Plataforma exclusiva para la gestión interna de logística. 
            Genera cotizaciones precisas, administra rutas y optimiza los <span className="brand-highlight">servicios de transporte</span> de la empresa.
          </p>
        </div>
        <div className="absolute bottom-12 left-24 text-xs text-gray-500 opacity-40">
          &copy; {new Date().getFullYear()} Transportes Lujav.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="form-section">
        <div className="form-container">
          {/* Header */}
          <div className="form-header">
            <h2 className="form-title">
              {isLogin ? "Plataforma Lujav" : "Solicitar Acceso"}
            </h2>
            <p className="form-subtitle">
              {isLogin
                ? "Ingresa tus credenciales para gestionar cotizaciones."
                : "Contacta al administrador para obtener una cuenta."}
            </p>
          </div>

          {/* Social Buttons */}
          <div className="social-grid">
            <button
              className="social-btn"
              onClick={() => handleSocialLogin("google")}
            >
              <FcGoogle className="h-5 w-5" />
              <span>Google</span>
            </button>
            <button
              className="social-btn"
              onClick={() => handleSocialLogin("facebook")}
            >
              <FaFacebookF className="h-5 w-5 text-[#1877F2]" />
              <span>Facebook</span>
            </button>
          </div>

          <div className="divider">
            <span className="divider-text">o con email</span>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleAuth}>
            {!isLogin && (
              <div className="input-group">
                <label htmlFor="name" className="input-label">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Ej. Juan Pérez"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                placeholder="nombre@empresa.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="input-label">
                  Contraseña
                </label>
                {isLogin && (
                  <a
                    href="#"
                    className="text-xs font-medium text-gray-500 hover:text-black transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                )}
              </div>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <IoEyeOffOutline className="h-5 w-5" />
                  ) : (
                    <IoEyeOutline className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Procesando..." : isLogin ? "Entrar" : "Registrarse"}
            </button>
          </form>

          <p className="toggle-text">
            {isLogin ? "¿Aún no tienes cuenta?" : "¿Ya tienes una cuenta?"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="toggle-link"
            >
              {isLogin ? "Crear cuenta" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
