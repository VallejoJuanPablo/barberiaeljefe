import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../../services/empresa.service';
import { Empresa } from '../../../models/cliente.model';

@Component({
  selector: 'app-empresa-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="p-6 min-h-full">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-white">Empresas</h2>
          <p class="text-gray-400 text-sm mt-1">{{ empresas().length }} empresa(s) registradas</p>
        </div>
        <a
          routerLink="/admin/empresas/nueva"
          class="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva empresa
        </a>
      </div>

      <!-- Error -->
      @if (error()) {
        <div class="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">
          {{ error() }}
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center items-center py-20">
          <div class="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <!-- Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (empresa of empresas(); track empresa._id) {
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors">
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="min-w-0">
                  <p class="text-white font-semibold text-lg truncate">{{ empresa.nombre }}</p>
                  <p class="text-amber-400 font-mono text-sm">{{ empresa.codigo }}</p>
                </div>
                @if (empresa.estado === 'activa') {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-800 flex-shrink-0">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Activa
                  </span>
                } @else if (empresa.estado === 'suspendida') {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-800 flex-shrink-0">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Suspendida
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-400 border border-gray-600 flex-shrink-0">
                    Baja
                  </span>
                }
              </div>

              <!-- Info -->
              <div class="space-y-2 mb-4">
                <div class="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="text-gray-300">{{ empresa.contacto }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span class="text-purple-300 font-medium">{{ getNombreMembresia(empresa) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="text-gray-300">
                    <span class="text-white font-medium">{{ empresa.asignados || 0 }}</span> / {{ empresa.pack }} empleados
                  </span>
                  <!-- Barra de cupo -->
                  <div class="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden ml-1">
                    <div
                      class="h-full rounded-full transition-all"
                      [class]="cupoClass(empresa)"
                      [style.width.%]="cupoPercent(empresa)"
                    ></div>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-amber-400 font-medium">{{ formatPrecio(empresa.precioMensual) }}/mes</span>
                </div>
                @if (empresa.ultimoPago) {
                  <div class="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-gray-400">Último pago: {{ formatFecha(empresa.ultimoPago) }}</span>
                  </div>
                }
              </div>

              <!-- Acciones -->
              <div class="flex items-center gap-2 pt-3 border-t border-gray-700">
                @if (empresa.estado === 'activa') {
                  <button
                    (click)="registrarPago(empresa)"
                    [disabled]="procesando() === empresa._id"
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    @if (procesando() === empresa._id) {
                      <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    }
                    Registrar pago
                  </button>
                  <button
                    (click)="suspender(empresa)"
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-medium rounded-lg transition-colors"
                  >
                    Suspender
                  </button>
                } @else if (empresa.estado === 'suspendida') {
                  <button
                    (click)="registrarPago(empresa)"
                    [disabled]="procesando() === empresa._id"
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Reactivar (registrar pago)
                  </button>
                }
                <div class="flex-1"></div>
                <a
                  [routerLink]="['/admin/empresas', empresa._id]"
                  class="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-700 rounded transition-colors"
                  title="Editar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </a>
                <button
                  (click)="confirmarEliminar(empresa)"
                  class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                  title="Eliminar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          } @empty {
            <div class="col-span-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-12 text-center text-gray-500">
              <div class="flex flex-col items-center gap-2">
                <span class="text-4xl">🏢</span>
                <p class="text-sm">No hay empresas registradas</p>
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal eliminar -->
      @if (empresaAEliminar()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-white">Eliminar empresa</h3>
            </div>
            <p class="text-gray-300 mb-6">
              ¿Estás seguro que querés eliminar <strong class="text-white">{{ empresaAEliminar()?.nombre }}</strong>? Solo se puede eliminar si no tiene empleados asignados.
            </p>
            <div class="flex gap-3">
              <button
                (click)="cancelarEliminar()"
                class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                (click)="eliminar()"
                [disabled]="eliminando()"
                class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {{ eliminando() ? 'Eliminando...' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class EmpresaListComponent implements OnInit {
  private readonly empresaService = inject(EmpresaService);

  empresas = signal<Empresa[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  procesando = signal<string | null>(null);
  empresaAEliminar = signal<Empresa | null>(null);
  eliminando = signal(false);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading.set(true);
    this.error.set(null);
    this.empresaService.getAll().subscribe({
      next: (data) => {
        this.empresas.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las empresas. Verificá que el servidor esté activo.');
        this.loading.set(false);
      }
    });
  }

  registrarPago(empresa: Empresa) {
    if (!empresa._id) return;
    this.procesando.set(empresa._id);
    this.empresaService.registrarPago(empresa._id).subscribe({
      next: (res) => {
        this.empresas.update(list =>
          list.map(e => e._id === empresa._id ? { ...e, ...res.empresa, asignados: e.asignados } : e)
        );
        this.procesando.set(null);
      },
      error: () => {
        this.error.set('Error al registrar el pago.');
        this.procesando.set(null);
      }
    });
  }

  suspender(empresa: Empresa) {
    if (!empresa._id) return;
    this.empresaService.suspender(empresa._id).subscribe({
      next: (res) => {
        this.empresas.update(list =>
          list.map(e => e._id === empresa._id ? { ...e, ...res.empresa, asignados: e.asignados } : e)
        );
      },
      error: () => this.error.set('Error al suspender la empresa.')
    });
  }

  confirmarEliminar(empresa: Empresa) {
    this.empresaAEliminar.set(empresa);
  }

  cancelarEliminar() {
    this.empresaAEliminar.set(null);
  }

  eliminar() {
    const empresa = this.empresaAEliminar();
    if (!empresa?._id) return;
    this.eliminando.set(true);
    this.empresaService.delete(empresa._id).subscribe({
      next: () => {
        this.empresas.update(list => list.filter(e => e._id !== empresa._id));
        this.empresaAEliminar.set(null);
        this.eliminando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al eliminar la empresa.');
        this.eliminando.set(false);
        this.empresaAEliminar.set(null);
      }
    });
  }

  cupoPercent(empresa: Empresa): number {
    return Math.min(100, ((empresa.asignados || 0) / empresa.pack) * 100);
  }

  cupoClass(empresa: Empresa): string {
    const pct = this.cupoPercent(empresa);
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-amber-500';
    return 'bg-green-500';
  }

  getNombreMembresia(empresa: Empresa): string {
    const mem = empresa.membresiaId;
    if (typeof mem === 'object' && mem?.nombre) return mem.nombre;
    return 'Sin membresía';
  }

  formatPrecio(precio: number): string {
    return '$' + precio.toLocaleString('es-AR');
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
