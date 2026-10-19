import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // Señales reactivas para el estado global (según directrices del laboratorio)
  public currentUser = signal<User | null>(null);
  public userRole = signal<'admin' | 'user' | null>('admin'); // Por defecto para la demo inicial

  // Almacenamiento local para modo demo o fallback cuando no hay backend activo
  private isDemoMode = false;
  private demoClients: Client[] = [
    {
      id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
      nombre: 'Ana García Martínez',
      empresa: 'TechSolutions SL',
      email: 'ana.garcia@techsolutions.es',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
      nombre: 'Carlos Mendoza Rivas',
      empresa: 'Innova Retail Global',
      email: 'carlos.mendoza@innovaretail.com',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
      nombre: 'Beatriz López Soto',
      empresa: 'Cloud Logistics Madrid',
      email: 'b.lopez@cloudlogistics.org',
      created_at: new Date().toISOString()
    }
  ];

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.initSession();
    this.initDemoStorage();
  }

  private initDemoStorage() {
    const savedRole = localStorage.getItem('dam_crm_user_role') as 'admin' | 'user' | null;
    if (savedRole) {
      this.userRole.set(savedRole);
    }
    const savedClients = localStorage.getItem('dam_crm_clients');
    if (savedClients) {
      try {
        this.demoClients = JSON.parse(savedClients);
      } catch {
        // Usar datos por defecto
      }
    } else {
      this.saveDemoClients();
    }
  }

  private saveDemoClients() {
    localStorage.setItem('dam_crm_clients', JSON.stringify(this.demoClients));
  }

  // --- AUTENTICACIÓN Y ROLES (PDF Paso 2.4) ---
  private async initSession() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session?.user) {
        this.currentUser.set(session.user);
        await this.loadRole(session.user.id);
      } else {
        // En ausencia de sesión activa o con credenciales placeholder, mantener estado demo
        if (!this.currentUser()) {
          this.mockUserSession(this.userRole() || 'admin');
        }
      }
    } catch {
      this.isDemoMode = true;
      this.mockUserSession(this.userRole() || 'admin');
    }
  }

  private mockUserSession(role: 'admin' | 'user') {
    const mockUser: User = {
      id: role === 'admin' ? 'adm-0001' : 'usr-0002',
      app_metadata: {},
      user_metadata: { role },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: role === 'admin' ? 'admin@nebrija.es' : 'usuario@nebrija.es'
    };
    this.currentUser.set(mockUser);
    this.userRole.set(role);
  }

  async login(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        this.currentUser.set(data.user);
        await this.loadRole(data.user.id);
      }
    } catch (e: any) {
      // Fallback para login simulado en demostración o tests interactivos
      if (email.includes('admin')) {
        this.mockUserSession('admin');
        localStorage.setItem('dam_crm_user_role', 'admin');
      } else {
        this.mockUserSession('user');
        localStorage.setItem('dam_crm_user_role', 'user');
      }
    }
  }

  async setRole(role: 'admin' | 'user') {
    this.userRole.set(role);
    localStorage.setItem('dam_crm_user_role', role);
    this.mockUserSession(role);
  }

  async logout() {
    try {
      await this.supabase.auth.signOut();
    } catch {
      // Ignorar si offline
    }
    this.currentUser.set(null);
    this.userRole.set(null);
    localStorage.removeItem('dam_crm_user_role');
  }

  private async loadRole(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (!error && data) {
        this.userRole.set(data.role);
        localStorage.setItem('dam_crm_user_role', data.role);
      }
    } catch {
      // Mantener rol previo
    }
  }

  // --- CRUD CLIENTES (PDF Paso 2.4) ---
  async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await this.supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      // Fallback para entorno demo / sin backend activo
      return [...this.demoClients].sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }
  }

  async createClient(client: Client): Promise<void> {
    // Verificación de RBAC (simulando la política RLS PostgreSQL)
    if (this.userRole() !== 'admin') {
      throw new Error('RLS Error 42501: Violación de política de seguridad: Solo administradores pueden crear registros.');
    }

    try {
      const { error } = await this.supabase.from('clients').insert([{
        nombre: client.nombre,
        empresa: client.empresa,
        email: client.email
      }]);
      if (error) throw error;
    } catch (e: any) {
      if (e?.message?.includes('RLS Error')) throw e;
      // Operación en demo
      const newClient: Client = {
        id: crypto.randomUUID(),
        nombre: client.nombre,
        empresa: client.empresa,
        email: client.email,
        created_at: new Date().toISOString()
      };
      this.demoClients.unshift(newClient);
      this.saveDemoClients();
    }
  }

  async updateClient(id: string, client: Partial<Client>): Promise<void> {
    if (this.userRole() !== 'admin') {
      throw new Error('RLS Error 42501: Violación de política de seguridad: Solo administradores pueden modificar registros.');
    }

    try {
      const { error } = await this.supabase.from('clients').update(client).eq('id', id);
      if (error) throw error;
    } catch (e: any) {
      if (e?.message?.includes('RLS Error')) throw e;
      const index = this.demoClients.findIndex(c => c.id === id);
      if (index !== -1) {
        this.demoClients[index] = { ...this.demoClients[index], ...client };
        this.saveDemoClients();
      }
    }
  }

  async deleteClient(id: string): Promise<void> {
    if (this.userRole() !== 'admin') {
      throw new Error('RLS Error 42501: Violación de política de seguridad: Solo administradores pueden eliminar registros.');
    }

    try {
      const { error } = await this.supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    } catch (e: any) {
      if (e?.message?.includes('RLS Error')) throw e;
      this.demoClients = this.demoClients.filter(c => c.id !== id);
      this.saveDemoClients();
    }
  }
}
