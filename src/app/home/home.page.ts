import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Client } from '../models/client.model';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonButton,
  IonInput,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonToast,
  IonBadge,
  IonButtons,
  IonSegment,
  IonSegmentButton,
  IonNote,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  createOutline,
  trashOutline,
  shieldCheckmarkOutline,
  personOutline,
  businessOutline,
  mailOutline,
  personCircleOutline,
  addCircleOutline,
  closeOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  phonePortraitOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonIcon,
    IonButton,
    IonInput,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonToast,
    IonBadge,
    IonButtons,
    IonSegment,
    IonSegmentButton,
    IonNote,
    IonGrid,
    IonRow,
    IonCol
  ],
})
export class HomePage implements OnInit {
  public supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);

  clients: Client[] = [];
  clientForm: FormGroup;
  editingClientId: string | null = null;
  toastMessage = '';
  isToastOpen = false;

  // Señales expuestas a la vista (según guion oficial de laboratorio)
  isAdmin = this.supabaseService.userRole;
  currentUser = this.supabaseService.currentUser;

  constructor() {
    addIcons({
      createOutline,
      trashOutline,
      shieldCheckmarkOutline,
      personOutline,
      businessOutline,
      mailOutline,
      personCircleOutline,
      addCircleOutline,
      closeOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      phonePortraitOutline
    });

    this.clientForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      empresa: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async ngOnInit() {
    // IMPORTANTE: En un entorno real, hacer login antes de cargar
    // Para simplificar esta demo y permitir evaluación inmediata:
    await this.loadClients();
  }

  async loadClients() {
    try {
      this.clients = await this.supabaseService.getClients();
    } catch (e: any) {
      this.showToast('Error cargando clientes: ' + (e?.message || e));
    }
  }

  async saveClient() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    try {
      const formValue = this.clientForm.value;
      if (this.editingClientId) {
        await this.supabaseService.updateClient(this.editingClientId, formValue);
        this.showToast('Cliente actualizado correctamente');
      } else {
        await this.supabaseService.createClient(formValue);
        this.showToast('Cliente insertado correctamente');
      }
      this.resetForm();
      await this.loadClients();
    } catch (e: any) {
      this.showToast('Error de guardado (¿Eres admin?): ' + (e?.message || e));
    }
  }

  editClient(client: Client) {
    this.editingClientId = client.id!;
    this.clientForm.patchValue({
      nombre: client.nombre,
      empresa: client.empresa,
      email: client.email
    });

    const formElement = document.getElementById('client-form-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async deleteClient(id: string) {
    try {
      await this.supabaseService.deleteClient(id);
      this.showToast('Cliente eliminado satisfactoriamente');
      if (this.editingClientId === id) {
        this.resetForm();
      }
      await this.loadClients();
    } catch (e: any) {
      this.showToast('Error eliminando: ' + (e?.message || e));
    }
  }

  resetForm() {
    this.clientForm.reset();
    this.editingClientId = null;
  }

  setToastOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.isToastOpen = true;
  }

  onRoleChange(event: any) {
    const selectedRole = event.detail.value as 'admin' | 'user';
    this.supabaseService.setRole(selectedRole);
    if (selectedRole !== 'admin') {
      this.resetForm();
    }
    this.showToast(`Rol cambiado a: ${selectedRole.toUpperCase()}`);
  }
}
