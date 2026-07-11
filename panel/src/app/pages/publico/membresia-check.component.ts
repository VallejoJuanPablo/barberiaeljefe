import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { MembresiaCheck } from '../../models/cliente.model';

@Component({
  selector: 'app-membresia-check',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">

      <!-- Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 border border-gray-700 mb-4">
          <span class="text-4xl">✂️</span>
        </div>
        <h1 class="text-3xl font-bold text-white">Barbería <span class="text-amber-400">El Jefe</span></h1>
        <p class="text-gray-400 mt-2">Consultá el estado de tu membresía</p>
      </div>

      <!-- Form de búsqueda -->
      <div class="w-full max-w-md">
        <div class="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl">
          <label class="block text-sm font-medium text-gray-300 mb-2">Código de membresía</label>
          <div class="flex gap-3">
            <input
              type="text"
              [(ngModel)]="codigo"
              (keydown.enter)="consultar()"
              placeholder="Ej: BJF-0001"
              class="flex-1 bg-gray-700 border border-gray-600 text-white placeholder-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 transition-colors font-mono tracking-wider text-center"
            />
            <button
              (click)="consultar()"
              [disabled]="!codigo.trim() || loading()"
              class="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              @if (loading()) {
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            </button>
          </div>
        </div>

        <!-- Resultado -->
        @if (resultado()) {
          <div
            class="mt-6 rounded-2xl border-2 p-6 shadow-2xl transition-all"
            [class]="resultado()!.activo ? 'bg-green-950 border-green-600' : 'bg-red-950 border-red-700'"
          >
            <!-- Icono + Estado -->
            <div class="flex items-center gap-4 mb-5">
              <div
                class="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
                [class]="resultado()!.activo ? 'bg-green-900' : 'bg-red-900'"
              >
                {{ resultado()!.activo ? '✅' : '❌' }}
              </div>
              <div>
                <p class="text-lg font-bold text-white">{{ resultado()!.nombre }}</p>
                <p
                  class="text-sm font-semibold uppercase tracking-wider"
                  [class]="resultado()!.activo ? 'text-green-400' : 'text-red-400'"
                >
                  {{ resultado()!.activo ? 'Membresía ACTIVA' : 'Membresía INACTIVA' }}
                </p>
              </div>
            </div>

            <!-- Detalles -->
            <div class="space-y-3 pt-4 border-t" [class]="resultado()!.activo ? 'border-green-800' : 'border-red-800'">
              @if (resultado()!.activo) {
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-400">Tipo de membresía</span>
                  <span class="text-sm font-semibold text-white capitalize px-3 py-1 rounded-full bg-amber-900/50 text-amber-300 border border-amber-800">
                    {{ resultado()!.tipo }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-400">Válida hasta</span>
                  <span class="text-sm font-semibold text-green-300">
                    {{ formatearFecha(resultado()!.fechaFin) }}
                  </span>
                </div>
              }
              <div class="pt-2">
                <p
                  class="text-sm text-center py-2 px-4 rounded-lg"
                  [class]="resultado()!.activo ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'"
                >
                  {{ resultado()!.mensaje }}
                </p>
              </div>
            </div>
          </div>
        }

        <!-- Error -->
        @if (errorMsg()) {
          <div class="mt-6 bg-gray-800 border border-gray-700 rounded-2xl p-6 text-center">
            <p class="text-4xl mb-3">🔍</p>
            <p class="text-white font-medium">No encontramos esa membresía</p>
            <p class="text-gray-400 text-sm mt-1">Verificá el código e intentá de nuevo</p>
          </div>
        }
      </div>

      <!-- Footer -->
      <p class="text-gray-600 text-xs mt-10">✂️ Barbería El Jefe &mdash; Sistema de membresías</p>
    </div>
  `
})
export class MembresiaCheckComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);

  codigo = '';
  loading = signal(false);
  resultado = signal<MembresiaCheck | null>(null);
  errorMsg = signal<string | null>(null);

  ngOnInit() {
    const codigoParam = this.route.snapshot.queryParamMap.get('codigo');
    if (codigoParam) {
      this.codigo = codigoParam;
      this.consultar();
    }
  }

  consultar() {
    const cod = this.codigo.trim();
    if (!cod) return;

    this.loading.set(true);
    this.resultado.set(null);
    this.errorMsg.set(null);

    this.clienteService.checkMembresia(cod).subscribe({
      next: (data) => {
        this.resultado.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('No se encontró ningún cliente con ese código.');
        this.loading.set(false);
      }
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
