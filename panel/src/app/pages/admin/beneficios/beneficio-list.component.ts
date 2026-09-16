import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BeneficioService } from '../../../services/beneficio.service';
import { Beneficio } from '../../../models/cliente.model';

@Component({
  selector: 'app-beneficio-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Beneficios</h1>
          <p class="text-sm text-gray-400 mt-1">{{ beneficios().length }} beneficios en {{ categorias().length }} categorías</p>
        </div>
        <a routerLink="/admin/beneficios/nuevo"
           class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg text-sm transition-colors text-center">
          + Nuevo beneficio
        </a>
      </div>

      <!-- Filtro por categoría -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button (click)="filtroCategoria.set('')"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                [class]="!filtroCategoria() ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'">
          Todas
        </button>
        @for (cat of categorias(); track cat) {
          <button (click)="filtroCategoria.set(cat)"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  [class]="filtroCategoria() === cat ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'">
            {{ cat }}
          </button>
        }
      </div>

      <!-- Listado agrupado por categoría -->
      @for (grupo of beneficiosFiltrados(); track grupo.categoria) {
        <div class="mb-6">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">{{ grupo.icono }}</span>
            <h2 class="text-sm font-semibold text-amber-400 uppercase tracking-wider">{{ grupo.categoria }}</h2>
            <span class="text-xs text-gray-500">({{ grupo.items.length }})</span>
          </div>

          <div class="space-y-2">
            @for (ben of grupo.items; track ben._id) {
              <div class="bg-gray-800 border border-gray-700 rounded-xl px-5 py-3 hover:border-amber-500/30 transition-colors">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                         [class]="ben.activo ? 'bg-green-500' : 'bg-red-500'"></div>
                    <div class="min-w-0">
                      <p class="text-sm text-white truncate">{{ ben.nombre }}</p>
                      @if (ben.codigo) {
                        <p class="text-xs text-amber-400 font-mono mt-0.5">{{ ben.codigo }}</p>
                      }
                    </div>
                  </div>
                  <div class="hidden sm:flex gap-2 flex-shrink-0">
                    <a [routerLink]="['/admin/beneficios', ben._id]"
                       class="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                      Editar
                    </a>
                    <button (click)="eliminar(ben)"
                            class="text-xs px-3 py-1.5 bg-gray-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
                <div class="flex gap-2 mt-2 sm:hidden">
                  <a [routerLink]="['/admin/beneficios', ben._id]"
                     class="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                    Editar
                  </a>
                  <button (click)="eliminar(ben)"
                          class="text-xs px-3 py-1.5 bg-gray-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (beneficios().length === 0) {
        <div class="text-center py-16">
          <p class="text-gray-500">No hay beneficios creados</p>
          <a routerLink="/admin/beneficios/nuevo" class="text-amber-400 text-sm mt-2 inline-block hover:underline">Crear el primero</a>
        </div>
      }
    </div>
  `
})
export class BeneficioListComponent implements OnInit {
  private readonly beneficioService = inject(BeneficioService);

  beneficios = signal<Beneficio[]>([]);
  filtroCategoria = signal('');

  categorias = computed(() => {
    const cats = new Set(this.beneficios().map(b => b.categoria));
    return Array.from(cats).sort();
  });

  beneficiosFiltrados = computed(() => {
    const todos = this.beneficios();
    const filtro = this.filtroCategoria();
    const filtrados = filtro ? todos.filter(b => b.categoria === filtro) : todos;

    // Agrupar por categoría
    const map = new Map<string, { categoria: string; icono: string; items: Beneficio[] }>();
    for (const ben of filtrados) {
      if (!map.has(ben.categoria)) {
        map.set(ben.categoria, { categoria: ben.categoria, icono: ben.icono, items: [] });
      }
      map.get(ben.categoria)!.items.push(ben);
    }
    return Array.from(map.values()).sort((a, b) => a.categoria.localeCompare(b.categoria));
  });

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.beneficioService.getAll().subscribe(data => this.beneficios.set(data));
  }

  eliminar(ben: Beneficio) {
    if (!confirm(`¿Eliminar el beneficio "${ben.nombre}"? Se removerá de todas las membresías.`)) return;
    this.beneficioService.delete(ben._id!).subscribe(() => this.cargar());
  }
}
