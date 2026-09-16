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

      <!-- Search + Filtro estado -->
      <div class="flex flex-col sm:flex-row gap-3 mb-4">
        <div class="relative flex-1">
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
        <div class="flex bg-gray-800 border border-gray-700 rounded-lg p-1 gap-1">
          <button
            (click)="filtroEstado.set('todos')"
            class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            [class]="filtroEstado() === 'todos' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'"
          >
            Todos
          </button>
          <button
            (click)="filtroEstado.set('activos')"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            [class]="filtroEstado() === 'activos' ? 'bg-green-900/60 text-green-400 border border-green-800' : 'text-gray-400 hover:text-white'"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            Activos
          </button>
          <button
            (click)="filtroEstado.set('inactivos')"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            [class]="filtroEstado() === 'inactivos' ? 'bg-red-900/60 text-red-400 border border-red-800' : 'text-gray-400 hover:text-white'"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Inactivos
          </button>
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
        <!-- Cards mobile -->
        <div class="space-y-3 md:hidden">
          @for (cliente of clientesFiltrados(); track cliente._id) {
            <div class="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="min-w-0">
                  <p class="text-white font-semibold truncate">{{ cliente.nombre }}</p>
                  <p class="text-amber-400 font-mono text-sm">{{ cliente.codigo }}</p>
                </div>
                @if (cliente.membresia.activa) {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-800 flex-shrink-0">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Activa
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-400 border border-red-800 flex-shrink-0">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Inactiva
                  </span>
                }
              </div>
              <div class="flex items-center gap-3 mb-3 text-sm">
                @if (cliente.telefono) {
                  <span class="text-gray-400">{{ cliente.telefono }}</span>
                }
                @if (cliente.membresia.tipo) {
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                    [class]="badgeMembresia(cliente.membresia.tipo)"
                  >
                    {{ cliente.membresia.tipo }}
                  </span>
                }
              </div>
              <div class="flex items-center gap-2 pt-3 border-t border-gray-700">
                <button
                  (click)="mostrarQR(cliente.codigo)"
                  class="flex items-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm14 3h.01M17 14h3v3h-3v-3zm0 4h3v3h-3v-3zm-4 0h3v3h-3v-3zm-4-4h.01" />
                  </svg>
                  QR
                </button>
                @if (!cliente.membresia.activa) {
                  <button
                    (click)="renovar(cliente)"
                    [disabled]="renovando() === cliente._id"
                    class="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    @if (renovando() === cliente._id) {
                      <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    }
                    Renovar
                  </button>
                }
                <div class="flex-1"></div>
                <a
                  [routerLink]="['/admin/clientes', cliente._id]"
                  class="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </a>
                <button
                  (click)="confirmarEliminar(cliente)"
                  class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          } @empty {
            <div class="bg-gray-800 border border-gray-700 rounded-xl px-4 py-12 text-center text-gray-500">
              <div class="flex flex-col items-center gap-2">
                <span class="text-4xl">✂️</span>
                <p class="text-sm">No hay clientes registrados</p>
              </div>
            </div>
          }
        </div>

        <!-- Table desktop -->
        <div class="hidden md:block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-700/50 border-b border-gray-700">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Código</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Teléfono</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Membresía</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th class="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">QR</th>
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
                    <td class="px-4 py-3 text-center">
                      <button
                        (click)="mostrarQR(cliente.codigo)"
                        class="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-700 rounded transition-colors"
                        title="Ver QR"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm14 3h.01M17 14h3v3h-3v-3zm0 4h3v3h-3v-3zm-4 0h3v3h-3v-3zm-4-4h.01" />
                        </svg>
                      </button>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex items-center justify-end gap-2">
                        @if (!cliente.membresia.activa) {
                          <button
                            (click)="renovar(cliente)"
                            [disabled]="renovando() === cliente._id"
                            class="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            title="Renovar 1 mes"
                          >
                            @if (renovando() === cliente._id) {
                              <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                              </svg>
                            } @else {
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            }
                            Renovar
                          </button>
                        }
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
                    <td colspan="7" class="px-4 py-12 text-center text-gray-500">
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
      <!-- Modal QR -->
      @if (qrCodigo()) {
        <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" (click)="cerrarQR()">
          <div class="relative max-w-lg w-full" (click)="$event.stopPropagation()">
            <button
              (click)="cerrarQR()"
              class="absolute -top-3 -right-3 w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center z-10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="bg-white rounded-xl p-4 shadow-2xl">
              <img
                #qrImg
                [src]="'/img/frente_' + qrCodigo() + '.jpg'"
                [alt]="'Tarjeta ' + qrCodigo()"
                class="w-full rounded-lg"
                crossorigin="anonymous"
              />
              <div class="flex items-center justify-center gap-3 mt-4">
                <p class="text-gray-800 font-mono text-sm font-semibold">{{ qrCodigo() }}</p>
                <button
                  (click)="copiarImagen(qrImg)"
                  class="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  @if (copiado()) {
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copiada
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copiar imagen
                  }
                </button>
              </div>
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
  filtroEstado = signal<'todos' | 'activos' | 'inactivos'>('todos');
  clienteAEliminar = signal<Cliente | null>(null);
  eliminando = signal(false);
  qrCodigo = signal<string | null>(null);
  copiado = signal(false);
  renovando = signal<string | null>(null);

  clientesFiltrados = computed(() => {
    let lista = this.clientes();
    const estado = this.filtroEstado();
    if (estado === 'activos') lista = lista.filter(c => c.membresia.activa);
    else if (estado === 'inactivos') lista = lista.filter(c => !c.membresia.activa);
    const b = this.busqueda.toLowerCase().trim();
    if (b) lista = lista.filter(c =>
      c.nombre.toLowerCase().includes(b) || c.codigo.toLowerCase().includes(b)
    );
    return lista;
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

  mostrarQR(codigo: string) {
    this.qrCodigo.set(codigo);
  }

  cerrarQR() {
    this.qrCodigo.set(null);
    this.copiado.set(false);
  }

  async copiarImagen(img: HTMLImageElement) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(), 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      // Fallback: abrir en nueva pestaña para guardar manualmente
      window.open('/img/frente_' + this.qrCodigo() + '.jpg', '_blank');
    }
  }

  renovar(cliente: Cliente) {
    if (!cliente._id) return;
    this.renovando.set(cliente._id);

    const hoy = new Date();
    const mesProximo = new Date();
    mesProximo.setMonth(mesProximo.getMonth() + 1);

    const datos = {
      membresia: {
        ...cliente.membresia,
        activa: true,
        fechaInicio: hoy.toISOString(),
        fechaFin: mesProximo.toISOString()
      }
    };

    this.clienteService.update(cliente._id, datos).subscribe({
      next: (actualizado) => {
        this.clientes.update(list =>
          list.map(c => c._id === cliente._id ? actualizado : c)
        );
        this.renovando.set(null);
      },
      error: () => {
        this.error.set('Error al renovar la membresía. Intentá de nuevo.');
        this.renovando.set(null);
      }
    });
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
