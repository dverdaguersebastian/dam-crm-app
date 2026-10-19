-- ==============================================================================
-- Laboratorio: Gestión Completa CRUD con Roles (Ionic, Angular Standalone, Supabase)
-- Módulo Profesional: Desarrollo de Interfaces (Código 0488) - DAM2
-- Configuración del Backend (SQL en Supabase) - Paso 2.1
-- ==============================================================================

-- 1. Crear enumeración de roles
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- 2. Crear tabla de perfiles (vinculada a autenticación)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role public.user_role DEFAULT 'user' NOT NULL
);

-- 3. Crear tabla de clientes
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  empresa TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Políticas para Perfiles (Lectura propia)
CREATE POLICY "Leer perfil propio" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- 6. Políticas para Clientes (RBAC)
-- Lectura: Todos los usuarios autenticados
CREATE POLICY "Lectura para autenticados" ON public.clients
  FOR SELECT TO authenticated USING (true);

-- Escritura (Insert, Update, Delete): SOLO Administradores
CREATE POLICY "Escritura solo para admins" ON public.clients
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. Trigger automático para creación de perfil al registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Datos iniciales de prueba (Seed Data)
INSERT INTO public.clients (nombre, empresa, email) VALUES
  ('Ana García Martínez', 'TechSolutions SL', 'ana.garcia@techsolutions.es'),
  ('Carlos Mendoza Rivas', 'Innova Retail Global', 'carlos.mendoza@innovaretail.com'),
  ('Beatriz López Soto', 'Cloud Logistics Madrid', 'b.lopez@cloudlogistics.org')
ON CONFLICT (email) DO NOTHING;
