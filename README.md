# Laboratorio: Gestión Completa CRUD con Roles (Ionic, Angular Standalone, Supabase)

**Módulo Profesional:** Desarrollo de Interfaces (Código 0488)  
**Ciclo Formativo:** Grado Superior en Desarrollo de Aplicaciones Multiplataforma (DAM2) — Universidad Nebrija  
**Alumno:** Diego Verdaguer Sebastián  
**Fecha de Entrega:** 19 de Octubre de 2026  

---

## 📌 Enlaces del Proyecto

- **📦 Repositorio en GitHub:** [https://github.com/dverdaguersebastian/dam-crm-app](https://github.com/dverdaguersebastian/dam-crm-app)
- **🚀 Despliegue en Vercel:** [https://dam-crm-app.vercel.app](https://dam-crm-app.vercel.app)
- **📄 Memoria Técnica en PDF (2 páginas):** [`Memoria_Laboratorio_CRUD_Supabase_DAM2.pdf`](./Memoria_Laboratorio_CRUD_Supabase_DAM2.pdf)
- **🗄️ Script SQL Backend (Supabase):** [`supabase-setup.sql`](./supabase-setup.sql)

---

## 🎯 Cumplimiento Curricular (Comunidad de Madrid)

| Resultado de Aprendizaje | Criterio de Evaluación | Evidencia de Implementación | Estado |
|---|---|---|:---:|
| **RA 1:** Confecciona interfaces gráficas de usuario utilizando herramientas visuales y librerías de componentes. | **CE 1.c:** Se han establecido los mecanismos de enlace entre los datos del modelo y la vista (Data Binding bidireccional reactivo). | `ReactiveFormsModule`, enlace `formControlName`, validaciones síncronas en TypeScript y sincronización reactiva con `Signals`. | ✅ **SUPERADO** |
| **RA 3:** Crea componentes visuales personalizados evaluando y gestionando eventos. | **CE 3.d:** Se han gestionado eventos de autenticación y modificado la interfaz en función de los roles de usuario. | Control de Acceso Basado en Roles (RBAC), control flow declarativo `@if (isAdmin() === 'admin')`, ocultamiento estricto de formulario y botones de borrado/edición para perfil lector. | ✅ **SUPERADO** |
| **RA 4:** Diseña interfaces usables y accesibles. | **CE 4.a:** Se han aplicado principios de diseño responsivo (Uso de `ion-list` y `ion-grid`). | Diseño responsivo fluido con `ion-grid`, `ion-row`, `ion-col`, listas nativas `ion-list` y gestos táctiles `ion-item-sliding`. | ✅ **SUPERADO** |

---

## 🛠️ Arquitectura Técnica del Sistema

El sistema implementa una arquitectura segura y desacoplada de doble barrera:

1. **Backend (Supabase / PostgreSQL 15):**
   - Enumeración de tipos de rol: `user_role ('admin', 'user')`.
   - Tabla vinculada de perfiles `public.profiles` con clave foránea a `auth.users(id)` y cascada de eliminación.
   - Tabla de entidades de negocio `public.clients` con identificadores únicos `UUID`.
   - **Row Level Security (RLS):**
     - Lectura (`SELECT`): Permitida para todos los usuarios autenticados.
     - Escritura (`INSERT`, `UPDATE`, `DELETE`): Exclusiva para usuarios cuyo perfil verifique `role = 'admin'` mediante subconsulta con cláusulas `USING` y `WITH CHECK`.

2. **Frontend (Ionic Framework + Angular Standalone):**
   - **Angular Signals:** Reactividad sin sobrecarga de ciclo de detección con `currentUser = signal<User | null>` y `userRole = signal<'admin' | 'user' | null>`.
   - **Formularios Reactivos (`FormGroup`):** Validación síncrona en cliente para nombre (longitud mín. 3 caracteres), empresa (requerido) y email (formato válido RFC).
   - **Control Flow Moderno de Angular (`@if`, `@for`, `@empty`):** Renderizado condicional sin directivas estructurales heredadas.
   - **Componentes Táctiles Móviles:** Deslizamiento nativo de elementos (`ion-item-sliding`, `ion-item-options`, `ion-item-option`) para editar y eliminar clientes.

---

## 🚀 Guía de Ejecución Local

1. Clonar el repositorio y acceder a la carpeta del proyecto:
   ```bash
   git clone https://github.com/dverdaguersebastian/dam-crm-app.git
   cd dam-crm-app
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo de Ionic:
   ```bash
   ionic serve
   ```
   *La aplicación estará accesible en `http://localhost:8100/`.*

4. Compilar para producción:
   ```bash
   npm run build
   ```

---

## 📸 Capturas de Evidencia Incluidas en la Memoria

1. **`admin-view.png`:** Interfaz de usuario con rol de Administrador activo (formulario reactivo de inserción/edición y controles CRUD visibles).
2. **`user-view.png`:** Interfaz adaptada con rol de Usuario Lector (formulario y acciones de mutación completamente ocultados por RBAC).
3. **`validation-errors.png`:** Mensajes de error contextuales y bloqueo de envío ante datos inválidos.
4. **`edit-mode.png`:** Modo de edición con carga de datos en formulario mediante `patchValue()`, resalte de fila activa y botón de cancelar.
5. **`mobile-view.png`:** Adaptación responsiva fluida en pantalla móvil.
6. **`toast-notification.png`:** Notificación `IonToast` informando del éxito de la operación.
