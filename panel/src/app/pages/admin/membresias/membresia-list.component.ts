import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MembresiaService } from '../../../services/membresia.service';
import { Membresia } from '../../../models/cliente.model';

@Component({
  selector: 'app-membresia-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Membresías</h1>
          <p class="text-sm text-gray-400 mt-1">{{ membresias().length }} planes</p>
        </div>
        <a routerLink="/admin/membresias/nueva"
           class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg text-sm transition-colors">
          + Nueva membresía
        </a>
      </div>

      <!-- Grid de cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (m of membresias(); track m._id) {
          <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-amber-500/30 transition-colors">
            <!-- Header card -->
            <div class="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-white">{{ m.nombre }}</h3>
                <p class="text-amber-400 font-bold text-lg">{{ m.precio | currency:'ARS':'$':'1.0-0' }}<span class="text-xs text-gray-400 font-normal"> /mes</span></p>
              </div>
              <div class="w-3 h-3 rounded-full" [class]="m.activa ? 'bg-green-500' : 'bg-red-500'"></div>
            </div>

            <!-- Incluye -->
            <div class="px-5 py-3">
              <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Incluye</p>
              <ul class="space-y-1">
                @for (item of m.incluye; track item) {
                  <li class="text-sm text-gray-300 flex items-start gap-2">
                    <span class="text-amber-500 mt-0.5">•</span>
                    <span>{{ item }}</span>
                  </li>
                }
              </ul>
            </div>

            <!-- Beneficios count + acciones -->
            <div class="px-5 py-3 border-t border-gray-700 flex items-center justify-between">
              <span class="text-xs text-gray-500">{{ m.beneficios.length }} categorías de beneficios</span>
              <div class="flex gap-2">
                <a [routerLink]="['/admin/membresias', m._id]"
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

      @if (membresias().length === 0) {
        <div class="text-center py-16">
          <p class="text-gray-500">No hay membresías creadas</p>
          <a routerLink="/admin/membresias/nueva" class="text-amber-400 text-sm mt-2 inline-block hover:underline">Crear la primera</a>
        </div>
      }
    </div>
  `
})
export class MembresiaListComponent implements OnInit {
  private readonly membresiaService = inject(MembresiaService);
  membresias = signal<Membresia[]>([]);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.membresiaService.getAll().subscribe(data => this.membresias.set(data));
  }

  eliminar(m: Membresia) {
    if (!confirm(`¿Eliminar la membresía "${m.nombre}"?`)) return;
    this.membresiaService.delete(m._id!).subscribe(() => this.cargar());
  }
}
