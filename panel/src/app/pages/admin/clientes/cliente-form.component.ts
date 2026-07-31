import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';
import { MembresiaService } from '../../../services/membresia.service';
import { Membresia } from '../../../models/cliente.model';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6 min-h-full">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <a
          routerLink="/admin/clientes"
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-white">{{ esEdicion ? 'Editar cliente' : 'Nuevo cliente' }}</h2>
          <p class="text-gray-400 text-sm mt-0.5">{{ esEdicion ? 'Modificá los datos del cliente' : 'Completá los datos para registrar un nuevo cliente' }}</p>
        </div>
      </div>

      <!-- Loading inicial -->
      @if (loadingInicial()) {
        <div class="flex justify-center items-center py-20">
          <div class="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="max-w-2xl">
          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">

            <!-- Error -->
            @if (error()) {
              <div class="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                {{ error() }}
              </div>
            }

            <!-- Card: Datos personales -->
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
              <h3 class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">Datos personales</h3>

              <!-- Código -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1.5">Código</label>
                <input
                  type="text"
                  formControlName="codigo"
                  placeholder="BEJ-0001 (vacío = autogenerado)"
                  class="w-full bg-gray-700 border text-white placeholder-gray-500 px-4 py-2.5 rounded-lg font-mono focus:outline-none transition-colors border-gray-600 focus:border-amber-500"
                />
                <p class="mt-1 text-xs text-gray-500">{{ esEdicion ? 'Podés cambiar el código del cliente' : 'Dejalo vacío para generar uno automáticamente' }}</p>
              </div>

              <!-- Nombre -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1.5">Nombre completo <span class="text-red-400">*</span></label>
                <input
                  type="text"
                  formControlName="nombre"
                  placeholder="Juan Pérez"
                  class="w-full bg-gray-700 border text-white placeholder-gray-500 px-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                  [class]="inputClass('nombre')"
                />
                @if (campoInvalido('nombre')) {
                  <p class="mt-1 text-xs text-red-400">El nombre es requerido</p>
                }
              </div>

              <!-- Teléfono -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1.5">Teléfono <span class="text-red-400">*</span></label>
                <input
                  type="tel"
                  formControlName="telefono"
                  placeholder="+54 11 1234-5678"
                  class="w-full bg-gray-700 border text-white placeholder-gray-500 px-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                  [class]="inputClass('telefono')"
                />
                @if (campoInvalido('telefono')) {
                  <p class="mt-1 text-xs text-red-400">El teléfono es requerido</p>
                }
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1.5">Email <span class="text-red-400">*</span></label>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="juan@email.com"
                  class="w-full bg-gray-700 border text-white placeholder-gray-500 px-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                  [class]="inputClass('email')"
                />
                @if (campoInvalido('email')) {
                  <p class="mt-1 text-xs text-red-400">Ingresá un email válido</p>
                }
              </div>
            </div>

            <!-- Card: Membresía -->
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4" formGroupName="membresia">
              <h3 class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">Membresía</h3>

              <!-- Tipo -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1.5">Tipo de membresía <span class="text-red-400">*</span></label>
                <select
                  formControlName="tipo"
                  class="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">Seleccionar...</option>
                  @for (m of tiposMembresia(); track m._id) {
                    <option [value]="m.nombre">{{ m.nombre }} — {{ formatPrecio(m.precio) }}/mes</option>
                  }
                </select>
              </div>

              <!-- Estado activa -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                <button
                  type="button"
                  (click)="toggleActiva()"
                  class="flex items-center gap-3 group"
                >
                  <div
                    class="relative w-11 h-6 rounded-full transition-colors duration-200"
                    [class]="form.get('membresia.activa')?.value ? 'bg-amber-500' : 'bg-gray-600'"
                  >
                    <div
                      class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                      [class]="form.get('membresia.activa')?.value ? 'translate-x-5' : 'translate-x-0'"
                    ></div>
                  </div>
                  <span class="text-sm" [class]="form.get('membresia.activa')?.value ? 'text-amber-400' : 'text-gray-400'">
                    {{ form.get('membresia.activa')?.value ? 'Membresía activa' : 'Membresía inactiva' }}
                  </span>
                </button>
              </div>

              <!-- Fechas -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Fecha de inicio <span class="text-red-400">*</span></label>
                  <input
                    type="date"
                    formControlName="fechaInicio"
                    class="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Fecha de fin <span class="text-red-400">*</span></label>
                  <input
                    type="date"
                    formControlName="fechaFin"
                    class="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <!-- Historial de consultas -->
            @if (esEdicion && logs().length > 0) {
              <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
                  Historial de consultas
                  <span class="text-gray-500 font-normal normal-case">({{ logs().length }})</span>
                </h3>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                  @for (log of logs(); track log._id) {
                    <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-700/50 text-sm">
                      <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full" [class]="log.resultado ? 'bg-green-500' : 'bg-red-500'"></div>
                        <span class="text-gray-300">{{ formatearFechaLog(log.fecha) }}</span>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-xs text-gray-500 font-mono">{{ log.ip || 'IP desconocida' }}</span>
                        <span class="text-xs px-2 py-0.5 rounded-full"
                              [class]="log.resultado ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'">
                          {{ log.resultado ? 'Activa' : 'Inactiva' }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
            @if (esEdicion && logs().length === 0 && !loadingInicial()) {
              <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Historial de consultas</h3>
                <p class="text-gray-500 text-sm text-center py-4">Sin consultas registradas</p>
              </div>
            }

            <!-- Acciones -->
            <div class="flex gap-3 pt-2">
              <a
                routerLink="/admin/clientes"
                class="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-center font-medium rounded-lg transition-colors"
              >
                Cancelar
              </a>
              <button
                type="submit"
                [disabled]="saving() || form.invalid"
                class="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (saving()) {
                  <span class="flex items-center justify-center gap-2">
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Guardando...
                  </span>
                } @else {
                  {{ esEdicion ? 'Guardar cambios' : 'Registrar cliente' }}
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `
})
export class ClienteFormComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly membresiaService = inject(MembresiaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  esEdicion = false;
  clienteId = signal<string | null>(null);
  codigoActual = signal<string>('');
  loadingInicial = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  logs = signal<any[]>([]);
  tiposMembresia = signal<Membresia[]>([]);

  form: FormGroup = this.fb.group({
    codigo: [''],
    nombre: ['', Validators.required],
    telefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    membresia: this.fb.group({
      tipo: ['', Validators.required],
      activa: [true],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    })
  });

  ngOnInit() {
    this.membresiaService.getAll().subscribe(data => this.tiposMembresia.set(data));

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.esEdicion = true;
      this.clienteId.set(id);
      this.cargarCliente(id);
      this.cargarLogs(id);
    } else {
      // Default fechas para nuevo
      const hoy = new Date();
      const mesProximo = new Date();
      mesProximo.setMonth(mesProximo.getMonth() + 1);
      this.form.get('membresia.fechaInicio')?.setValue(this.formatDate(hoy));
      this.form.get('membresia.fechaFin')?.setValue(this.formatDate(mesProximo));
    }
  }

  cargarCliente(id: string) {
    this.loadingInicial.set(true);
    this.clienteService.getById(id).subscribe({
      next: (cliente) => {
        this.codigoActual.set(cliente.codigo);
        this.form.patchValue({
          codigo: cliente.codigo,
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          email: cliente.email,
          membresia: {
            tipo: cliente.membresia.tipo,
            activa: cliente.membresia.activa,
            fechaInicio: cliente.membresia.fechaInicio?.slice(0, 10) ?? '',
            fechaFin: cliente.membresia.fechaFin?.slice(0, 10) ?? ''
          }
        });
        this.loadingInicial.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el cliente.');
        this.loadingInicial.set(false);
      }
    });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const datos = this.form.value;
    const id = this.clienteId();

    const obs = id
      ? this.clienteService.update(id, datos)
      : this.clienteService.create(datos);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/clientes']);
      },
      error: () => {
        this.error.set('Error al guardar. Verificá los datos e intentá de nuevo.');
        this.saving.set(false);
      }
    });
  }

  toggleActiva() {
    const ctrl = this.form.get('membresia.activa');
    ctrl?.setValue(!ctrl.value);
  }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }

  inputClass(campo: string): string {
    const invalido = this.campoInvalido(campo);
    return invalido
      ? 'border-red-500 focus:border-red-400'
      : 'border-gray-600 focus:border-amber-500';
  }

  cargarLogs(id: string) {
    this.clienteService.getLogs(id).subscribe({
      next: (data) => this.logs.set(data),
      error: () => {}
    });
  }

  formatearFechaLog(fecha: string): string {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  formatPrecio(precio: number): string {
    return '$' + precio.toLocaleString('es-AR');
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
