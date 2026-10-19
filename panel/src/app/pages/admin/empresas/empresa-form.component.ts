import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmpresaService } from '../../../services/empresa.service';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente.model';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6 min-h-full">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <a
          routerLink="/admin/empresas"
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-white">{{ esEdicion ? 'Editar empresa' : 'Nueva empresa' }}</h2>
          <p class="text-gray-400 text-sm mt-0.5">{{ esEdicion ? 'Modificá los datos de la empresa' : 'Registrá una nueva empresa corporativa' }}</p>
        </div>
      </div>

      @if (loadingInicial()) {
        <div class="flex justify-center items-center py-20">
          <div class="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="max-w-2xl">
          <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">

            @if (error()) {
              <div class="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                {{ error() }}
              </div>
            }

            <!-- Datos empresa -->
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
              <h3 class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">Datos de la empresa</h3>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1.5">Nombre de la empresa <span class="text-red-400">*</span></label>
                <input
                  type="text"
                  formControlName="nombre"
                  placeholder="Ferretería López"
                  class="w-full bg-gray-700 border text-white placeholder-gray-500 px-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                  [class]="inputClass('nombre')"
                />
                @if (campoInvalido('nombre')) {
                  <p class="mt-1 text-xs text-red-400">El nombre es requerido</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1.5">Contacto / Responsable <span class="text-red-400">*</span></label>
                <input
                  type="text"
                  formControlName="contacto"
                  placeholder="Juan López"
                  class="w-full bg-gray-700 border text-white placeholder-gray-500 px-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                  [class]="inputClass('contacto')"
                />
                @if (campoInvalido('contacto')) {
                  <p class="mt-1 text-xs text-red-400">El contacto es requerido</p>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    formControlName="telefono"
                    placeholder="+54 11 1234-5678"
                    class="w-full bg-gray-700 border border-gray-600 focus:border-amber-500 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="empresa@email.com"
                    class="w-full bg-gray-700 border border-gray-600 focus:border-amber-500 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <!-- Pack -->
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
              <h3 class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">Pack de membresías</h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Cantidad de membresías <span class="text-red-400">*</span></label>
                  <input
                    type="number"
                    formControlName="pack"
                    min="1"
                    placeholder="Ej: 30"
                    class="w-full bg-gray-700 border text-white placeholder-gray-500 px-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                    [class]="inputClass('pack')"
                  />
                  @if (campoInvalido('pack')) {
                    <p class="mt-1 text-xs text-red-400">Ingresá la cantidad de membresías</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Monto mensual total <span class="text-red-400">*</span></label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input
                      type="number"
                      formControlName="precioMensual"
                      min="0"
                      placeholder="Ej: 15000"
                      class="w-full bg-gray-700 border text-white placeholder-gray-500 pl-8 pr-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                      [class]="inputClass('precioMensual')"
                    />
                  </div>
                  @if (campoInvalido('precioMensual')) {
                    <p class="mt-1 text-xs text-red-400">Ingresá el monto mensual</p>
                  }
                </div>
              </div>

              @if (form.get('pack')?.value && form.get('precioMensual')?.value) {
                <div class="bg-gray-700/50 rounded-lg p-4 mt-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-400">Costo por membresía</span>
                    <span class="text-lg font-bold text-amber-400">{{ costoPorMembresia() }}/mes</span>
                  </div>
                </div>
              }
            </div>

            <!-- Empleados asignados (solo edición) -->
            @if (esEdicion && empleados().length > 0) {
              <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 class="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
                  Empleados asignados
                  <span class="text-gray-500 font-normal normal-case">({{ empleados().length }}/{{ form.get('pack')?.value }})</span>
                </h3>
                <div class="space-y-2 max-h-64 overflow-y-auto">
                  @for (emp of empleados(); track emp._id) {
                    <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-700/50 text-sm">
                      <div class="flex items-center gap-3">
                        <span class="text-amber-400 font-mono text-xs">{{ emp.codigo }}</span>
                        <span class="text-white">{{ emp.nombre }}</span>
                      </div>
                      <span class="text-xs px-2 py-0.5 rounded-full"
                        [class]="emp.membresia.activa ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'">
                        {{ emp.membresia.activa ? 'Activa' : 'Inactiva' }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Acciones -->
            <div class="flex gap-3 pt-2">
              <a
                routerLink="/admin/empresas"
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
                  {{ esEdicion ? 'Guardar cambios' : 'Registrar empresa' }}
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `
})
export class EmpresaFormComponent implements OnInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  esEdicion = false;
  empresaId = signal<string | null>(null);
  loadingInicial = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  empleados = signal<Cliente[]>([]);

  form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    contacto: ['', Validators.required],
    telefono: [''],
    email: [''],
    pack: [null, [Validators.required, Validators.min(1)]],
    precioMensual: [null, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nueva') {
      this.esEdicion = true;
      this.empresaId.set(id);
      this.cargar(id);
    }
  }

  cargar(id: string) {
    this.loadingInicial.set(true);
    this.empresaService.getById(id).subscribe({
      next: (empresa) => {
        this.form.patchValue({
          nombre: empresa.nombre,
          contacto: empresa.contacto,
          telefono: empresa.telefono,
          email: empresa.email,
          pack: empresa.pack,
          precioMensual: empresa.precioMensual
        });
        this.loadingInicial.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'No se pudo cargar la empresa.');
        this.loadingInicial.set(false);
      }
    });

    this.empresaService.getEmpleados(id).subscribe({
      next: (data) => this.empleados.set(data),
      error: () => {}
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
    const id = this.empresaId();

    const obs = id
      ? this.empresaService.update(id, datos)
      : this.empresaService.create(datos);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/empresas']);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al guardar. Verificá los datos e intentá de nuevo.');
        this.saving.set(false);
      }
    });
  }

  costoPorMembresia(): string {
    const pack = this.form.get('pack')?.value;
    const precio = this.form.get('precioMensual')?.value;
    if (!pack || !precio) return '$0';
    const cpp = Math.round(precio / pack);
    return '$' + cpp.toLocaleString('es-AR');
  }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }

  inputClass(campo: string): string {
    return this.campoInvalido(campo)
      ? 'border-red-500 focus:border-red-400'
      : 'border-gray-600 focus:border-amber-500';
  }
}
