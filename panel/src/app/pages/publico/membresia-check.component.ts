import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { MembresiaCheck } from '../../models/cliente.model';

@Component({
  selector: 'app-membresia-check',
  standalone: true,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap');

    :host { display: block; }

    .font-display { font-family: 'Playfair Display', serif; }

    .gold { color: #c9a44c; }
    .gold-soft { color: rgba(201,164,76,0.5); }
    .gold-dim { color: rgba(201,164,76,0.25); }
    .bg-card { background: #0c0c0c; }

    .gold-border-subtle {
      border: 1px solid rgba(201,164,76,0.18);
    }

    .card-shine {
      position: relative;
      overflow: hidden;
    }
    .card-shine::before {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(201,164,76,0.04), transparent);
      animation: shine 5s ease-in-out infinite;
    }
    @keyframes shine {
      0%, 100% { left: -100%; }
      50% { left: 150%; }
    }

    .status-dot {
      animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.85); }
    }

    .ornament {
      color: rgba(201,164,76,0.2);
    }
  `],
  template: `
    <div class="min-h-screen bg-black flex flex-col items-center justify-center p-5 relative overflow-hidden">

      <!-- Línea dorada superior -->
      <div class="absolute top-0 left-0 right-0 h-px" style="background: linear-gradient(90deg, transparent 10%, rgba(201,164,76,0.4) 50%, transparent 90%);"></div>

      <div class="relative z-10 w-full max-w-md">

        <!-- Logo -->
        <div class="text-center mb-10">
          <img src="logo.png" alt="El Jefe" class="w-44 mx-auto" />
        </div>

        <!-- Sin código: pantalla de bienvenida -->
        @if (!codigoConsultado && !loading()) {
          <div class="text-center space-y-6">
            <div class="card-shine bg-card gold-border-subtle rounded-2xl p-8">
              <div class="ornament text-3xl mb-4">&#10022;</div>
              <p class="font-display text-lg text-white mb-2">Membresía</p>
              <p class="text-sm" style="color: rgba(255,255,255,0.35);">
                Escaneá el código QR de tu tarjeta para consultar el estado de tu membresía.
              </p>
            </div>

            <div class="flex items-center justify-center gap-3">
              <div class="h-px w-10" style="background: linear-gradient(90deg, transparent, rgba(201,164,76,0.2));"></div>
              <span class="text-xs tracking-[0.2em] uppercase gold-dim">El Jefe</span>
              <div class="h-px w-10" style="background: linear-gradient(90deg, rgba(201,164,76,0.2), transparent);"></div>
            </div>
          </div>
        }

        <!-- Loading -->
        @if (loading()) {
          <div class="card-shine bg-card gold-border-subtle rounded-2xl p-10 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style="border: 1px solid rgba(201,164,76,0.25);">
              <svg class="w-5 h-5 animate-spin gold" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </div>
            <p class="text-sm tracking-wider gold-soft">Verificando membresía</p>
          </div>
        }

        <!-- Resultado -->
        @if (resultado()) {
          <div class="card-shine bg-card gold-border-subtle rounded-2xl overflow-hidden">

            <!-- Estado -->
            <div class="px-7 py-4 flex items-center justify-between"
                 [style.border-bottom]="resultado()!.activo
                   ? '1px solid rgba(34,197,94,0.12)'
                   : '1px solid rgba(239,68,68,0.12)'">
              <div class="flex items-center gap-2.5">
                <div class="w-2 h-2 rounded-full status-dot"
                     [style.background]="resultado()!.activo ? '#22c55e' : '#ef4444'"></div>
                <span class="text-xs font-semibold tracking-[0.15em] uppercase"
                      [style.color]="resultado()!.activo ? '#22c55e' : '#ef4444'">
                  {{ resultado()!.activo ? 'Activa' : 'Inactiva' }}
                </span>
              </div>
              <span class="text-xs font-light" style="color: rgba(255,255,255,0.2);">
                {{ codigoConsultado }}
              </span>
            </div>

            <!-- Datos del miembro -->
            <div class="px-7 py-7">
              <p class="text-xs tracking-wider mb-1 gold-soft">Miembro</p>
              <h2 class="font-display text-2xl text-white mb-7">{{ resultado()!.nombre }}</h2>

              @if (resultado()!.activo) {
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm" style="color: rgba(255,255,255,0.35);">Plan</span>
                    <span class="text-sm font-semibold tracking-wider uppercase gold">
                      {{ resultado()!.tipo }}
                    </span>
                  </div>
                  <div class="h-px" style="background: rgba(201,164,76,0.08);"></div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm" style="color: rgba(255,255,255,0.35);">Válida hasta</span>
                    <span class="text-sm font-medium text-white">
                      {{ formatearFecha(resultado()!.fechaFin) }}
                    </span>
                  </div>
                </div>
              }
            </div>

            <!-- Mensaje -->
            <div class="px-7 py-3.5" style="border-top: 1px solid rgba(201,164,76,0.06);">
              <p class="text-xs text-center"
                 [style.color]="resultado()!.activo ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'">
                {{ resultado()!.mensaje }}
              </p>
            </div>
          </div>
        }

        <!-- Error (código no encontrado) -->
        @if (errorMsg()) {
          <div class="card-shine bg-card gold-border-subtle rounded-2xl p-9 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                 style="border: 1px solid rgba(201,164,76,0.12);">
              <svg class="w-5 h-5" style="color: rgba(201,164,76,0.35);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p class="text-sm text-white mb-1">{{ errorMsg() }}</p>
            <p class="text-xs" style="color: rgba(255,255,255,0.2);">Verificá el código con la barbería</p>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="relative z-10 mt-12 text-center">
        <p class="text-xs tracking-[0.15em]" style="color: rgba(255,255,255,0.1);">BARBERÍA EL JEFE</p>
      </div>

      <!-- Línea dorada inferior -->
      <div class="absolute bottom-0 left-0 right-0 h-px" style="background: linear-gradient(90deg, transparent 10%, rgba(201,164,76,0.4) 50%, transparent 90%);"></div>
    </div>
  `
})
export class MembresiaCheckComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);

  loading = signal(false);
  resultado = signal<MembresiaCheck | null>(null);
  errorMsg = signal<string | null>(null);
  codigoConsultado = '';

  ngOnInit() {
    const codigo = this.route.snapshot.queryParamMap.get('codigo');
    if (!codigo) return;
    this.consultar(codigo);
  }

  consultar(codigo: string) {
    this.codigoConsultado = codigo;
    this.loading.set(true);
    this.clienteService.checkMembresia(codigo).subscribe({
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
