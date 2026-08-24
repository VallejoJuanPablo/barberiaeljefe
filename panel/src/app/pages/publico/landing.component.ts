import { Component, OnInit, inject, signal } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { Membresia, Beneficio } from '../../models/cliente.model';

interface BeneficioAgrupado {
  categoria: string;
  icono: string;
  items: string[];
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
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

      <!-- HERO -->
      <section class="flex flex-col items-center pt-16 pb-12 px-5 text-center">
        <img src="/logo.png" alt="El Jefe" class="w-44 mx-auto mb-6" />
        <h1 class="font-display text-4xl md:text-5xl text-white mb-3">Barbería <span class="gold">El Jefe</span></h1>
        <p class="text-sm md:text-base tracking-widest uppercase gold-soft mb-6">Comunidad exclusiva</p>
        <div class="h-px w-24 gold-line mb-6"></div>
        <p class="text-gray-400 max-w-md text-sm leading-relaxed">
          Accedé a beneficios exclusivos en gastronomía, estética y más.
          Formá parte de la comunidad El Jefe.
        </p>
      </section>

      <!-- POR QUÉ ELEGIRNOS -->
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

      <!-- BENEFICIOS AGRUPADOS POR CATEGORÍA -->
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

      <!-- CONTACTO -->
      <section class="px-5 pb-16 max-w-md mx-auto text-center fade-in">
        <div class="h-px w-16 gold-line mx-auto mb-8"></div>
        <p class="text-xs tracking-[0.2em] uppercase gold-soft mb-2">Contacto</p>
        <h2 class="font-display text-2xl text-white mb-4">¿Tenés dudas?</h2>
        <p class="text-sm text-gray-400">Escribinos por WhatsApp y te contamos cómo acceder a los beneficios.</p>
      </section>

      <!-- NEGOCIOS -->
      <section class="px-5 pb-16 max-w-lg mx-auto text-center fade-in">
        <div class="bg-card gold-border rounded-2xl px-8 py-10">
          <p class="text-xs tracking-[0.2em] uppercase gold-soft mb-3">Para negocios</p>
          <h2 class="font-display text-2xl text-white mb-4">¿Querés sumar tu negocio?</h2>
          <p class="text-sm text-gray-400 mb-6 leading-relaxed">
            Si sos negocio y querés sumarte a nuestro club de beneficios, contactate con nosotros.
          </p>
          <a [href]="whatsappUrl('Hola! Tengo un negocio y me interesa sumarme al club de beneficios')" target="_blank"
             class="inline-block px-8 py-3 rounded-xl text-sm font-semibold text-white btn-whatsapp">
            Contactanos
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="text-center pb-8">
        <p class="text-xs tracking-[0.15em]" style="color: rgba(255,255,255,0.1);">BARBERÍA EL JEFE</p>
      </footer>

      <!-- Línea dorada inferior -->
      <div class="absolute bottom-0 left-0 right-0 h-px gold-line"></div>

      <!-- WhatsApp widget flotante -->
      <a [href]="whatsappUrl('Hola! Quiero información sobre los beneficios')" target="_blank"
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
  beneficiosAgrupados = signal<BeneficioAgrupado[]>([]);

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
    const fallback: BeneficioAgrupado[] = [
      { categoria: 'Gastronomía', icono: '🍔', items: ['Descuentos exclusivos en gastronomía'] },
      { categoria: 'Fitness & bienestar', icono: '🏋️', items: ['Descuentos en gimnasios y estética'] },
      { categoria: 'Indumentaria', icono: '👕', items: ['Descuentos en indumentaria'] },
    ];
    this.beneficiosAgrupados.set(fallback);
  }

  /** Agrupa beneficios de todos los planes por categoría, deduplicando case-insensitive */
  private agruparBeneficios(planes: Membresia[]) {
    const map = new Map<string, { icono: string; seen: Set<string>; items: string[] }>();

    for (const plan of planes) {
      for (const ben of plan.beneficios) {
        if (!ben.activo) continue;
        const catKey = ben.categoria;
        if (!map.has(catKey)) {
          map.set(catKey, { icono: ben.icono, seen: new Set(), items: [] });
        }
        const entry = map.get(catKey)!;
        if (!entry.icono && ben.icono) entry.icono = ben.icono;
        const key = ben.nombre.trim().toLowerCase();
        if (!entry.seen.has(key)) {
          entry.seen.add(key);
          entry.items.push(ben.nombre.trim());
        }
      }
    }

    const agrupados: BeneficioAgrupado[] = [];
    map.forEach((val, key) => {
      agrupados.push({ categoria: key, icono: val.icono, items: val.items });
    });

    this.beneficiosAgrupados.set(agrupados);
  }

  whatsappUrl(msg: string): string {
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }
}
