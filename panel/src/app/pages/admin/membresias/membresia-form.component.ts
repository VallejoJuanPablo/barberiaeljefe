import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MembresiaService } from '../../../services/membresia.service';
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

        <!-- Beneficios -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Beneficios</h2>
            <button type="button" (click)="agregarCategoria()"
                    class="text-xs px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors">
              + Categoría
            </button>
          </div>

          @for (ben of beneficios; track $index) {
            <div class="border border-gray-600 rounded-lg p-4 space-y-3">
              <div class="flex gap-2 items-end">
                <div class="w-16">
                  <label class="block text-xs text-gray-500 mb-1">Icono</label>
                  <input type="text" [(ngModel)]="ben.icono" [name]="'icono_' + $index"
                         class="w-full px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus:border-amber-500" />
                </div>
                <div class="flex-1">
                  <label class="block text-xs text-gray-500 mb-1">Categoría</label>
                  <input type="text" [(ngModel)]="ben.categoria" [name]="'cat_' + $index"
                         class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                         placeholder="Ej: Gastronomía" />
                </div>
                <button type="button" (click)="beneficios.splice($index, 1)"
                        class="px-2 py-2 text-gray-500 hover:text-red-400 transition-colors">✕</button>
              </div>

              @for (item of ben.items; track $index) {
                <div class="flex gap-2 pl-8">
                  <input type="text" [(ngModel)]="ben.items[$index]" [name]="'ben_' + $index + '_item_' + $index"
                         class="flex-1 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                         placeholder="Beneficio..." />
                  <button type="button" (click)="ben.items.splice($index, 1)"
                          class="px-2 text-gray-500 hover:text-red-400 text-sm transition-colors">✕</button>
                </div>
              }
              <button type="button" (click)="ben.items.push('')"
                      class="ml-8 text-xs text-gray-500 hover:text-amber-400 transition-colors">+ Agregar beneficio</button>
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
  beneficios: Beneficio[] = [];

  ngOnInit() {
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
        this.beneficios = m.beneficios.map(b => ({ ...b, items: [...b.items] }));
      });
    }
  }

  agregarIncluye() {
    this.incluye.push('');
  }

  agregarCategoria() {
    this.beneficios.push({ categoria: '', icono: '', items: [''] });
  }

  onSubmit() {
    this.loading = true;
    const data = {
      nombre: this.nombre,
      precio: this.precio,
      descripcion: this.descripcion,
      activa: this.activa,
      incluye: this.incluye.filter(i => i.trim()),
      beneficios: this.beneficios
        .filter(b => b.categoria.trim())
        .map(b => ({ ...b, items: b.items.filter(i => i.trim()) }))
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
