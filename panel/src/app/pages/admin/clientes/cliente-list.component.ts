import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente.model';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="p-6 min-h-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-white">Clientes</h2>
          <p class="text-gray-400 text-sm mt-1">{{ clientesFiltrados().length }} cliente(s) registrados</p>
        </div>
        <a
          routerLink="/admin/clientes/nuevo"
          class="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo cliente
        </a>
      </div>

      <!-- Search -->
      <div class="mb-4">
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            [(ngModel)]="busqueda"
            placeholder="Buscar por nombre o código..."
            class="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
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
        <!-- Table -->
        <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-700/50 border-b border-gray-700">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Código</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Teléfono</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Membresía</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th class="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                @for (cliente of clientesFiltrados(); track cliente._id) {
                  <tr class="hover:bg-gray-700/30 transition-colors">
                    <td class="px-4 py-3 text-amber-400 font-mono text-sm font-medium">{{ cliente.codigo }}</td>
                    <td class="px-4 py-3 text-white font-medium">{{ cliente.nombre }}</td>
                    <td class="px-4 py-3 text-gray-300">{{ cliente.telefono }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                        [class]="badgeMembresia(cliente.membresia.tipo)"
                      >
                        {{ cliente.membresia.tipo }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      @if (cliente.membresia.activa) {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-800">
                          <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                          Activa
                        </span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-800">
                          <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          Inactiva
                        </span>
                      }
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <a
                          [routerLink]="['/admin/clientes', cliente._id]"
                          class="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-700 rounded transition-colors"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </a>
                        <button
                          (click)="confirmarEliminar(cliente)"
                          class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                          title="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-4 py-12 text-center text-gray-500">
                      <div class="flex flex-col items-center gap-2">
                        <span class="text-4xl">✂️</span>
                        <p class="text-sm">No hay clientes registrados</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Modal de confirmación de eliminación -->
      @if (clienteAEliminar()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-white">Eliminar cliente</h3>
            </div>
            <p class="text-gray-300 mb-6">
              ¿Estás seguro que querés eliminar a <strong class="text-white">{{ clienteAEliminar()?.nombre }}</strong>? Esta acción no se puede deshacer.
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
                @if (eliminando()) {
                  Eliminando...
                } @else {
                  Eliminar
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ClienteListComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);

  clientes = signal<Cliente[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  busqueda = '';
  clienteAEliminar = signal<Cliente | null>(null);
  eliminando = signal(false);

  clientesFiltrados = computed(() => {
    const b = this.busqueda.toLowerCase().trim();
    if (!b) return this.clientes();
    return this.clientes().filter(c =>
      c.nombre.toLowerCase().includes(b) || c.codigo.toLowerCase().includes(b)
    );
  });

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.loading.set(true);
    this.error.set(null);
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los clientes. Verificá que el servidor esté activo.');
        this.loading.set(false);
      }
    });
  }

  badgeMembresia(tipo: string): string {
    const map: Record<string, string> = {
      basica: 'bg-blue-900/50 text-blue-300 border border-blue-800',
      premium: 'bg-purple-900/50 text-purple-300 border border-purple-800',
      vip: 'bg-amber-900/50 text-amber-300 border border-amber-800'
    };
    return map[tipo] ?? 'bg-gray-700 text-gray-300 border border-gray-600';
  }

  confirmarEliminar(cliente: Cliente) {
    this.clienteAEliminar.set(cliente);
  }

  cancelarEliminar() {
    this.clienteAEliminar.set(null);
  }

  eliminar() {
    const cliente = this.clienteAEliminar();
    if (!cliente?._id) return;

    this.eliminando.set(true);
    this.clienteService.delete(cliente._id).subscribe({
      next: () => {
        this.clientes.update(list => list.filter(c => c._id !== cliente._id));
        this.clienteAEliminar.set(null);
        this.eliminando.set(false);
      },
      error: () => {
        this.error.set('Error al eliminar el cliente. Intentá de nuevo.');
        this.eliminando.set(false);
        this.clienteAEliminar.set(null);
      }
    });
  }
}
