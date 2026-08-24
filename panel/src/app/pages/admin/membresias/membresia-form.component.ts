import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MembresiaService } from '../../../services/membresia.service';
import { BeneficioService } from '../../../services/beneficio.service';
import { Beneficio } from '../../../models/cliente.model';

@Component({
  selector: 'app-membresia-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="p-6 max-w-3xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/admin/membresias"
           class="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-white">{{ isEdit ? 'Editar' : 'Nueva' }} membresía</h1>
      </div>

      <form (ngSubmit)="onSubmit()" class="space-y-6">

        <!-- Datos básicos -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Datos del plan</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Nombre</label>
              <input type="text" [(ngModel)]="nombre" name="nombre" required
                     class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                     placeholder="Ej: Jefe Ejecutivo" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Precio mensual</label>
              <input type="number" [(ngModel)]="precio" name="precio" required
                     class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                     placeholder="42000" />
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-300 mb-1">Descripción <span class="text-gray-500">(opcional)</span></label>
            <textarea [(ngModel)]="descripcion" name="descripcion" rows="2"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none"
                      placeholder="Descripción del plan..."></textarea>
          </div>

          <div class="flex items-center gap-3">
            <input type="checkbox" [(ngModel)]="activa" name="activa" id="activa"
                   class="w-4 h-4 rounded accent-amber-500" />
            <label for="activa" class="text-sm text-gray-300">Plan activo</label>
          </div>
        </div>

        <!-- Servicios incluidos -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Servicios incluidos</h2>
            <button type="button" (click)="agregarIncluye()"
                    class="text-xs px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors">
              + Agregar
            </button>
          </div>

          @for (item of incluye; track $index) {
            <div class="flex gap-2">
              <input type="text" [(ngModel)]="incluye[$index]" [name]="'incluye_' + $index"
                     class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                     placeholder="Ej: 4 cortes de pelo por mes" />
              <button type="button" (click)="incluye.splice($index, 1)"
                      class="px-2 text-gray-500 hover:text-red-400 transition-colors">✕</button>
            </div>
          }
        </div>

        <!-- Beneficios (checkboxes agrupados por categoría) -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Beneficios</h2>
            <span class="text-xs text-gray-500">{{ selectedBeneficioIds.size }} seleccionados</span>
          </div>

          @if (beneficiosAgrupados().length === 0) {
            <p class="text-sm text-gray-500 text-center py-4">No hay beneficios creados. <a routerLink="/admin/beneficios/nuevo" class="text-amber-400 hover:underline">Crear uno</a></p>
          }

          @for (grupo of beneficiosAgrupados(); track grupo.categoria) {
            <div class="border border-gray-700 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-lg">{{ grupo.icono }}</span>
                <h3 class="text-sm font-semibold text-amber-400">{{ grupo.categoria }}</h3>
              </div>
              <div class="space-y-2">
                @for (ben of grupo.items; track ben._id) {
                  <label class="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox"
                           [checked]="selectedBeneficioIds.has(ben._id!)"
                           (change)="toggleBeneficio(ben._id!)"
                           class="w-4 h-4 mt-0.5 rounded accent-amber-500" />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-300 group-hover:text-white transition-colors">{{ ben.nombre }}</p>
                      @if (ben.codigo) {
                        <p class="text-xs text-gray-500 font-mono">{{ ben.codigo }}</p>
                      }
                    </div>
                    <div class="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                         [class]="ben.activo ? 'bg-green-500' : 'bg-red-500'"></div>
                  </label>
                }
              </div>
            </div>
          }
        </div>

        <!-- Acciones -->
        <div class="flex gap-3">
          <button type="submit" [disabled]="loading"
                  class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50">
            {{ loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear membresía') }}
          </button>
          <a routerLink="/admin/membresias"
             class="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  `
})
export class MembresiaFormComponent implements OnInit {
  private readonly membresiaService = inject(MembresiaService);
  private readonly beneficioService = inject(BeneficioService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEdit = false;
  editId = '';
  loading = false;

  nombre = '';
  precio = 0;
  descripcion = '';
  activa = true;
  incluye: string[] = [''];

  allBeneficios = signal<Beneficio[]>([]);
  selectedBeneficioIds = new Set<string>();

  beneficiosAgrupados = computed(() => {
    const todos = this.allBeneficios();
    const map = new Map<string, { categoria: string; icono: string; items: Beneficio[] }>();
    for (const ben of todos) {
      if (!map.has(ben.categoria)) {
        map.set(ben.categoria, { categoria: ben.categoria, icono: ben.icono, items: [] });
      }
      map.get(ben.categoria)!.items.push(ben);
    }
    return Array.from(map.values()).sort((a, b) => a.categoria.localeCompare(b.categoria));
  });

  ngOnInit() {
    // Cargar todos los beneficios disponibles
    this.beneficioService.getAll().subscribe(data => this.allBeneficios.set(data));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = id;
      this.membresiaService.getById(id).subscribe(m => {
        this.nombre = m.nombre;
        this.precio = m.precio;
        this.descripcion = m.descripcion;
        this.activa = m.activa;
        this.incluye = [...m.incluye];
        // Los beneficios vienen populados, extraer IDs
        this.selectedBeneficioIds = new Set(m.beneficios.map(b => b._id!));
      });
    }
  }

  agregarIncluye() {
    this.incluye.push('');
  }

  toggleBeneficio(id: string) {
    if (this.selectedBeneficioIds.has(id)) {
      this.selectedBeneficioIds.delete(id);
    } else {
      this.selectedBeneficioIds.add(id);
    }
  }

  onSubmit() {
    this.loading = true;
    const data = {
      nombre: this.nombre,
      precio: this.precio,
      descripcion: this.descripcion,
      activa: this.activa,
      incluye: this.incluye.filter(i => i.trim()),
      beneficios: Array.from(this.selectedBeneficioIds)
    };

    const obs = this.isEdit
      ? this.membresiaService.update(this.editId, data)
      : this.membresiaService.create(data);

    obs.subscribe({
      next: () => this.router.navigate(['/admin/membresias']),
      error: () => this.loading = false
    });
  }
}
