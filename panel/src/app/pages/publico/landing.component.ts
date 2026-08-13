import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';
import { Membresia, Beneficio } from '../../models/cliente.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CurrencyPipe],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap');

    :host { display: block; }

    .font-display { font-family: 'Playfair Display', serif; }

    .gold { color: #c9a44c; }
    .gold-soft { color: rgba(201,164,76,0.5); }
    .bg-card { background: #0c0c0c; }
    .bg-card-hover:hover { background: #111; }

    .gold-border { border: 1px solid rgba(201,164,76,0.18); }
    .gold-border-dim { border: 1px solid rgba(201,164,76,0.08); }

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

    .plan-card {
      transition: transform 0.3s ease, border-color 0.3s ease;
    }
    .plan-card:hover {
      transform: translateY(-4px);
      border-color: rgba(201,164,76,0.4);
    }

    .gold-line {
      background: linear-gradient(90deg, transparent 10%, rgba(201,164,76,0.4) 50%, transparent 90%);
    }

    .btn-whatsapp {
      background: #25D366;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .btn-whatsapp:hover {
      background: #1ebe5a;
      transform: scale(1.03);
    }

    .fade-in {
      animation: fadeIn 0.6s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .wa-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 50;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #25D366;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      animation: wa-bounce 2s ease-in-out infinite;
    }
    .wa-widget:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 24px rgba(37, 211, 102, 0.5);
    }
    @keyframes wa-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .wa-widget:hover {
      animation: none;
      transform: scale(1.1);
    }
  `],
  template: `
    <div class="min-h-screen bg-black relative overflow-hidden">

      <!-- Línea dorada superior -->
      <div class="absolute top-0 left-0 right-0 h-px gold-line"></div>

      <!-- ═══════════════════════════════════
           HERO
           ═══════════════════════════════════ -->
      <section class="flex flex-col items-center pt-16 pb-12 px-5 text-center">
        <img src="/logo.png" alt="El Jefe" class="w-44 mx-auto mb-6" />
        <h1 class="font-display text-4xl md:text-5xl text-white mb-3">Barbería <span class="gold">El Jefe</span></h1>
        <p class="text-sm md:text-base tracking-widest uppercase gold-soft mb-6">Membresías exclusivas</p>
        <div class="h-px w-24 gold-line mb-6"></div>
        <p class="text-gray-400 max-w-md text-sm leading-relaxed">
          Accedé a beneficios exclusivos en gastronomía, estética y más.
          Elegí el plan que mejor se adapte a tu estilo.
        </p>
      </section>

      <!-- ═══════════════════════════════════
           POR QUÉ ELEGIRNOS
           ═══════════════════════════════════ -->
      <section class="px-5 pb-12 max-w-3xl mx-auto fade-in">
        <div class="text-center mb-8">
          <div class="h-px w-16 gold-line mx-auto mb-6"></div>
          <p class="text-xs tracking-[0.2em] uppercase gold-soft mb-2">La experiencia</p>
          <h2 class="font-display text-2xl md:text-3xl text-white">¿Por qué El Jefe?</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="text-center">
            <div class="w-12 h-12 rounded-full gold-border flex items-center justify-center mx-auto mb-3">
              <span class="gold text-lg">01</span>
            </div>
            <p class="text-sm text-white font-semibold mb-1">Profesionales</p>
            <p class="text-xs text-gray-500">Barberos con experiencia y capacitación constante</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 rounded-full gold-border flex items-center justify-center mx-auto mb-3">
              <span class="gold text-lg">02</span>
            </div>
            <p class="text-sm text-white font-semibold mb-1">Ambiente</p>
            <p class="text-xs text-gray-500">Un espacio pensado para que te relajes y disfrutes</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 rounded-full gold-border flex items-center justify-center mx-auto mb-3">
              <span class="gold text-lg">03</span>
            </div>
            <p class="text-sm text-white font-semibold mb-1">Beneficios</p>
            <p class="text-xs text-gray-500">Descuentos exclusivos en gastronomía, estética y más</p>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════
           PLANES
           ═══════════════════════════════════ -->
      @if (planes().length > 0) {
        <section class="px-5 pb-12 max-w-5xl mx-auto fade-in">
          <div class="text-center mb-8">
            <p class="text-xs tracking-[0.2em] uppercase gold-soft mb-2">Nuestros planes</p>
            <h2 class="font-display text-2xl md:text-3xl text-white">Elegí tu membresía</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-{{ planes().length > 3 ? '3' : planes().length }} gap-5">
            @for (plan of planes(); track plan._id) {
              <div class="plan-card card-shine bg-card gold-border rounded-2xl overflow-hidden flex flex-col">
                <!-- Header del plan -->
                <div class="px-6 pt-6 pb-4 text-center" style="border-bottom: 1px solid rgba(201,164,76,0.08);">
                  <p class="text-xs tracking-[0.15em] uppercase gold-soft mb-1">Plan</p>
                  <h3 class="font-display text-xl text-white uppercase tracking-wider mb-3">{{ plan.nombre }}</h3>
                  <p class="font-display text-3xl gold">{{ plan.precio | currency:'ARS':'$':'1.0-0' }}</p>
                  <p class="text-xs text-gray-500 mt-1">/mes</p>
                </div>

                <!-- Incluye -->
                @if (plan.incluye.length > 0) {
                  <div class="px-6 py-4" style="border-bottom: 1px solid rgba(201,164,76,0.06);">
                    <p class="text-xs tracking-wider uppercase gold-soft mb-3">Incluye</p>
                    <ul class="space-y-2">
                      @for (item of plan.incluye; track item) {
                        <li class="flex items-start gap-2 text-sm text-gray-300">
                          <span class="gold mt-0.5 text-xs">&#10022;</span>
                          <span>{{ item }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                }

                <!-- Descripción -->
                @if (plan.descripcion) {
                  <div class="px-6 py-3 mt-auto">
                    <p class="text-xs text-gray-500 italic leading-relaxed">{{ plan.descripcion }}</p>
                  </div>
                }

                <!-- CTA -->
                <div class="px-6 pb-5 mt-auto">
                  <a [href]="whatsappUrl('Hola! Me interesa el plan ' + plan.nombre)" target="_blank"
                     class="block w-full text-center py-3 rounded-xl text-sm font-semibold text-white btn-whatsapp">
                    Quiero este plan
                  </a>
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- ═══════════════════════════════════
           BENEFICIOS AGRUPADOS POR CATEGORÍA
           ═══════════════════════════════════ -->
      @if (beneficiosAgrupados().length > 0) {
        <section class="px-5 pb-12 max-w-4xl mx-auto fade-in">
          <div class="text-center mb-8">
            <div class="h-px w-16 gold-line mx-auto mb-6"></div>
            <p class="text-xs tracking-[0.2em] uppercase gold-soft mb-2">Beneficios exclusivos</p>
            <h2 class="font-display text-2xl md:text-3xl text-white">Todo lo que incluyen nuestras membresías</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            @for (cat of beneficiosAgrupados(); track cat.categoria) {
              <div class="bg-card gold-border rounded-2xl px-6 py-5">
                <div class="flex items-center gap-2.5 mb-4">
                  <span class="text-2xl">{{ cat.icono }}</span>
                  <h3 class="font-display text-lg gold">{{ cat.categoria }}</h3>
                </div>
                <ul class="space-y-2">
                  @for (item of cat.items; track item) {
                    <li class="text-sm text-gray-300 pl-1 flex items-start gap-2">
                      <span class="gold text-xs mt-0.5">•</span>
                      <span>{{ item }}</span>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </section>
      }

      <!-- ═══════════════════════════════════
           CONTACTO
           ═══════════════════════════════════ -->
      <section class="px-5 pb-16 max-w-md mx-auto text-center fade-in">
        <div class="h-px w-16 gold-line mx-auto mb-8"></div>
        <p class="text-xs tracking-[0.2em] uppercase gold-soft mb-2">Contacto</p>
        <h2 class="font-display text-2xl text-white mb-4">¿Tenés dudas?</h2>
        <p class="text-sm text-gray-400">Escribinos por WhatsApp y te asesoramos sobre la mejor membresía para vos.</p>
      </section>

      <!-- Footer -->
      <footer class="text-center pb-8">
        <p class="text-xs tracking-[0.15em]" style="color: rgba(255,255,255,0.1);">BARBERÍA EL JEFE</p>
      </footer>

      <!-- Línea dorada inferior -->
      <div class="absolute bottom-0 left-0 right-0 h-px gold-line"></div>

      <!-- WhatsApp widget flotante -->
      <a [href]="whatsappUrl('Hola! Quiero información sobre las membresías')" target="_blank"
         class="wa-widget" aria-label="WhatsApp">
        <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  `
})
export class LandingComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly whatsappNumber = '5493794275062';

  planes = signal<Membresia[]>([]);
  beneficiosAgrupados = signal<Beneficio[]>([]);

  ngOnInit() {
    this.clienteService.getPlanes().subscribe({
      next: (data) => {
        if (data?.length) {
          this.planes.set(data);
          this.agruparBeneficios(data);
        } else {
          this.usarFallback();
        }
      },
      error: () => this.usarFallback()
    });
  }

  private usarFallback() {
    const fallback: Membresia[] = [
      {
        nombre: 'Básica',
        precio: 15000,
        incluye: ['2 cortes por mes', 'Barba incluida', 'Turno prioritario'],
        beneficios: [
          { categoria: 'Gastronomía', icono: '🍺', items: ['10% de descuento en bares adheridos'] },
          { categoria: 'Estética', icono: '💈', items: ['Producto de styling de regalo al mes'] },
        ],
        descripcion: 'Ideal para quienes buscan mantener su estilo con los básicos.',
        activa: true,
      },
      {
        nombre: 'Premium',
        precio: 25000,
        incluye: ['4 cortes por mes', 'Barba incluida', 'Cejas y nariz', 'Turno prioritario', 'Producto de styling'],
        beneficios: [
          { categoria: 'Gastronomía', icono: '🍺', items: ['15% de descuento en bares y restaurantes adheridos', 'Bebida de cortesía en la barbería'] },
          { categoria: 'Estética', icono: '💈', items: ['Tratamiento capilar mensual', 'Descuento en productos premium'] },
          { categoria: 'Bienestar', icono: '🏋️', items: ['Clase de prueba gratis en gimnasios adheridos'] },
        ],
        descripcion: 'Para los que quieren el paquete completo y beneficios extra.',
        activa: true,
      },
      {
        nombre: 'VIP',
        precio: 40000,
        incluye: ['Cortes ilimitados', 'Barba ilimitada', 'Cejas y nariz', 'Tratamiento capilar semanal', 'Productos premium incluidos', 'Acceso a eventos exclusivos'],
        beneficios: [
          { categoria: 'Gastronomía', icono: '🍺', items: ['20% de descuento en todos los locales adheridos', '2x1 en bares seleccionados', 'Bebida premium de cortesía'] },
          { categoria: 'Estética', icono: '💈', items: ['Tratamientos capilares ilimitados', 'Kit de productos premium trimestral', 'Asesoría de imagen personal'] },
          { categoria: 'Bienestar', icono: '🏋️', items: ['Pase libre en gimnasios adheridos', 'Sesión de masajes mensual'] },
          { categoria: 'Exclusivo', icono: '⭐', items: ['Acceso a eventos VIP de la barbería', 'Descuentos en indumentaria adherida', 'Tarjeta de presentación personalizada'] },
        ],
        descripcion: 'La experiencia El Jefe sin límites. Acceso total a servicios y beneficios.',
        activa: true,
      },
    ];
    this.planes.set(fallback);
    this.agruparBeneficios(fallback);
  }

  /** Agrupa beneficios de todos los planes en categorías únicas, sin duplicar ítems */
  private agruparBeneficios(planes: Membresia[]) {
    const map = new Map<string, { icono: string; items: Set<string> }>();

    for (const plan of planes) {
      for (const ben of plan.beneficios) {
        if (!map.has(ben.categoria)) {
          map.set(ben.categoria, { icono: ben.icono, items: new Set() });
        }
        const entry = map.get(ben.categoria)!;
        if (!entry.icono && ben.icono) entry.icono = ben.icono;
        for (const item of ben.items) {
          entry.items.add(item);
        }
      }
    }

    const agrupados: Beneficio[] = [];
    map.forEach((val, key) => {
      agrupados.push({ categoria: key, icono: val.icono, items: Array.from(val.items) });
    });

    this.beneficiosAgrupados.set(agrupados);
  }

  whatsappUrl(msg: string): string {
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }
}
