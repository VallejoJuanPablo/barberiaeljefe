import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BeneficioRelampagoService } from '../../../services/beneficio-relampago.service';
import { BeneficioRelampago } from '../../../models/cliente.model';

@Component({
  selector: 'app-beneficio-relampago-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">⚡ Beneficios Relámpago</h1>
          <p class="text-sm text-gray-400 mt-1">{{ beneficios().length }} beneficios — {{ vigentes() }} vigentes</p>
        </div>
        <a routerLink="/admin/beneficios-relampago/nuevo"
           class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg text-sm transition-colors">
          + Nuevo beneficio
        </a>
      </div>

      <!-- Filtro -->
      <div class="flex gap-2 mb-6">
        <button (click)="filtro.set('todas')"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                [class]="filtro() === 'todas' ? 'bg-amber-500 text-gray-900' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'">
          Todos
        </button>
        <button (click)="filtro.set('vigentes')"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                [class]="filtro() === 'vigentes' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'">
          Vigentes
        </button>
        <button (click)="filtro.set('futuras')"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                [class]="filtro() === 'futuras' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'">
          Futuros
        </button>
        <button (click)="filtro.set('vencidas')"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                [class]="filtro() === 'vencidas' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'">
          Vencidos
        </button>
      </div>

      <!-- Listado -->
      <div class="space-y-3">
        @for (ben of beneficiosFiltrados(); track ben._id) {
          <div class="bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 hover:border-amber-500/30 transition-colors">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-semibold text-white">{{ ben.titulo }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        [class]="estadoClass(ben)">
                    {{ estadoLabel(ben) }}
                  </span>
                </div>
                <p class="text-sm text-gray-400 mb-2">{{ ben.descripcion }}</p>
                <div class="flex gap-4 text-xs text-gray-500">
                  <span>Desde: {{ formatFecha(ben.fechaDesde) }}</span>
                  <span>Hasta: {{ formatFecha(ben.fechaHasta) }}</span>
                </div>
              </div>
              <div class="flex gap-2 flex-shrink-0">
                <a [routerLink]="['/admin/beneficios-relampago', ben._id]"
                   class="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                  Editar
                </a>
                <button (click)="eliminar(ben)"
                        class="text-xs px-3 py-1.5 bg-gray-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      @if (beneficios().length === 0) {
        <div class="text-center py-16">
          <p class="text-4xl mb-3">⚡</p>
          <p class="text-gray-500">No hay beneficios relámpago creados</p>
          <a routerLink="/admin/beneficios-relampago/nuevo" class="text-amber-400 text-sm mt-2 inline-block hover:underline">Crear el primero</a>
        </div>
      }
    </div>
  `
})
export class BeneficioRelampagoListComponent implements OnInit {
  private readonly service = inject(BeneficioRelampagoService);

  beneficios = signal<BeneficioRelampago[]>([]);
  filtro = signal<'todas' | 'vigentes' | 'futuras' | 'vencidas'>('todas');

  vigentes = computed(() => {
    const ahora = new Date();
    return this.beneficios().filter(b => b.activa && new Date(b.fechaDesde) <= ahora && new Date(b.fechaHasta) >= ahora).length;
  });

  beneficiosFiltrados = computed(() => {
    const ahora = new Date();
    const todos = this.beneficios();
    switch (this.filtro()) {
      case 'vigentes':
        return todos.filter(b => b.activa && new Date(b.fechaDesde) <= ahora && new Date(b.fechaHasta) >= ahora);
      case 'futuras':
        return todos.filter(b => new Date(b.fechaDesde) > ahora);
      case 'vencidas':
        return todos.filter(b => new Date(b.fechaHasta) < ahora);
      default:
        return todos;
    }
  });

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.service.getAll().subscribe(data => this.beneficios.set(data));
  }

  eliminar(ben: BeneficioRelampago) {
    if (!confirm(`¿Eliminar el beneficio relámpago "${ben.titulo}"?`)) return;
    this.service.delete(ben._id!).subscribe(() => this.cargar());
  }

  estadoLabel(ben: BeneficioRelampago): string {
    const ahora = new Date();
    if (new Date(ben.fechaHasta) < ahora) return 'Vencido';
    if (new Date(ben.fechaDesde) > ahora) return 'Futuro';
    if (!ben.activa) return 'Inactivo';
    return 'Vigente';
  }

  estadoClass(ben: BeneficioRelampago): string {
    const ahora = new Date();
    if (new Date(ben.fechaHasta) < ahora) return 'bg-gray-700 text-gray-400';
    if (new Date(ben.fechaDesde) > ahora) return 'bg-blue-500/20 text-blue-400';
    if (!ben.activa) return 'bg-red-500/20 text-red-400';
    return 'bg-green-500/20 text-green-400';
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
