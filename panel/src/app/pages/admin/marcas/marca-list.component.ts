import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarcaService } from '../../../services/marca.service';
import { Marca } from '../../../models/cliente.model';

@Component({
  selector: 'app-marca-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Marcas</h1>
          <p class="text-sm text-gray-400 mt-1">{{ marcas().length }} marcas aliadas</p>
        </div>
        <a routerLink="/admin/marcas/nueva"
           class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg text-sm transition-colors">
          + Nueva marca
        </a>
      </div>

      <!-- Grid de cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (m of marcas(); track m._id) {
          <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-amber-500/30 transition-colors">
            <div class="px-5 py-4 flex items-center gap-4">
              <!-- Logo -->
              @if (m.logo) {
                <img [src]="m.logo" [alt]="m.nombre"
                     class="w-14 h-14 rounded-lg object-contain bg-white p-1.5 flex-shrink-0" />
              } @else {
                <div class="w-14 h-14 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl text-gray-500">🏷️</span>
                </div>
              }

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold text-white truncate">{{ m.nombre }}</h3>
                  <div class="w-2 h-2 rounded-full flex-shrink-0"
                       [class]="m.activa ? 'bg-green-500' : 'bg-red-500'"></div>
                </div>
                @if (m.instagram) {
                  <a [href]="instagramUrl(m.instagram)" target="_blank"
                     class="text-xs text-amber-400 hover:underline">
                    {{ m.instagram }}
                  </a>
                }
              </div>
            </div>

            <!-- Acciones -->
            <div class="px-5 py-3 border-t border-gray-700 flex items-center justify-between">
              <span class="text-xs text-gray-500">Orden: {{ m.orden }}</span>
              <div class="flex gap-2">
                <a [routerLink]="['/admin/marcas', m._id]"
                   class="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                  Editar
                </a>
                <button (click)="eliminar(m)"
                        class="text-xs px-3 py-1.5 bg-gray-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      @if (marcas().length === 0) {
        <div class="text-center py-16">
          <p class="text-gray-500">No hay marcas registradas</p>
          <a routerLink="/admin/marcas/nueva" class="text-amber-400 text-sm mt-2 inline-block hover:underline">Agregar la primera</a>
        </div>
      }
    </div>
  `
})
export class MarcaListComponent implements OnInit {
  private readonly marcaService = inject(MarcaService);
  marcas = signal<Marca[]>([]);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.marcaService.getAll().subscribe(data => this.marcas.set(data));
  }

  eliminar(m: Marca) {
    if (!confirm(`¿Eliminar la marca "${m.nombre}"?`)) return;
    this.marcaService.delete(m._id!).subscribe(() => this.cargar());
  }

  instagramUrl(ig: string): string {
    if (ig.startsWith('http')) return ig;
    const handle = ig.replace(/^@/, '');
    return `https://www.instagram.com/${handle}`;
  }
}
