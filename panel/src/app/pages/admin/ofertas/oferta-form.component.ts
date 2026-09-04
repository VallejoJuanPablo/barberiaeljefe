import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { OfertaService } from '../../../services/oferta.service';

@Component({
  selector: 'app-oferta-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="p-6 max-w-2xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/admin/ofertas"
           class="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-white">{{ isEdit ? 'Editar' : 'Nueva' }} oferta relámpago</h1>
      </div>

      <form (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Datos de la oferta</h2>

          <div>
            <label class="block text-sm text-gray-300 mb-1">Título</label>
            <input type="text" [(ngModel)]="titulo" name="titulo" required
                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                   placeholder="Ej: 2x1 en cortes esta semana" />
          </div>

          <div>
            <label class="block text-sm text-gray-300 mb-1">Descripción</label>
            <textarea [(ngModel)]="descripcion" name="descripcion" required rows="3"
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none"
                      placeholder="Describí la oferta en detalle..."></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Fecha desde</label>
              <input type="date" [(ngModel)]="fechaDesde" name="fechaDesde" required
                     class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Fecha hasta</label>
              <input type="date" [(ngModel)]="fechaHasta" name="fechaHasta" required
                     class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          @if (errorFechas) {
            <p class="text-sm text-red-400">La fecha hasta debe ser igual o posterior a la fecha desde</p>
          }

          <div class="flex items-center gap-3">
            <input type="checkbox" [(ngModel)]="activa" name="activa" id="activa"
                   class="w-4 h-4 rounded accent-amber-500" />
            <label for="activa" class="text-sm text-gray-300">Oferta activa</label>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex gap-3">
          <button type="submit" [disabled]="loading"
                  class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50">
            {{ loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear oferta') }}
          </button>
          <a routerLink="/admin/ofertas"
             class="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  `
})
export class OfertaFormComponent implements OnInit {
  private readonly ofertaService = inject(OfertaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEdit = false;
  editId = '';
  loading = false;
  errorFechas = false;

  titulo = '';
  descripcion = '';
  fechaDesde = '';
  fechaHasta = '';
  activa = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = id;
      this.ofertaService.getById(id).subscribe(o => {
        this.titulo = o.titulo;
        this.descripcion = o.descripcion;
        this.fechaDesde = o.fechaDesde.substring(0, 10);
        this.fechaHasta = o.fechaHasta.substring(0, 10);
        this.activa = o.activa;
      });
    }
  }

  onSubmit() {
    if (this.fechaHasta < this.fechaDesde) {
      this.errorFechas = true;
      return;
    }
    this.errorFechas = false;
    this.loading = true;

    const data = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      activa: this.activa
    };

    const obs = this.isEdit
      ? this.ofertaService.update(this.editId, data)
      : this.ofertaService.create(data);

    obs.subscribe({
      next: () => this.router.navigate(['/admin/ofertas']),
      error: () => {
        this.loading = false;
        alert('Error al guardar. Verificá los datos e intentá de nuevo.');
      }
    });
  }
}
