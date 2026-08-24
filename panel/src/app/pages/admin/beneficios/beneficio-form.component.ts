import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BeneficioService } from '../../../services/beneficio.service';

@Component({
  selector: 'app-beneficio-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="p-6 max-w-2xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/admin/beneficios"
           class="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-white">{{ isEdit ? 'Editar' : 'Nuevo' }} beneficio</h1>
      </div>

      <form (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Datos del beneficio</h2>

          <div>
            <label class="block text-sm text-gray-300 mb-1">Nombre</label>
            <input type="text" [(ngModel)]="nombre" name="nombre" required
                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                   placeholder="Ej: 10% OFF en Tomate" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-300 mb-1">Categoría</label>
              <input type="text" [(ngModel)]="categoria" name="categoria" required
                     class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                     placeholder="Ej: Gastronomía" />
            </div>
            <div>
              <label class="block text-sm text-gray-300 mb-1">Icono</label>
              <input type="text" [(ngModel)]="icono" name="icono"
                     class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus:border-amber-500"
                     placeholder="🍔" />
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-300 mb-1">Código promocional <span class="text-gray-500">(opcional)</span></label>
            <input type="text" [(ngModel)]="codigo" name="codigo"
                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                   placeholder="Ej: TOMATE10" />
            <p class="text-xs text-gray-500 mt-1">Código que el cliente muestra en el comercio aliado</p>
          </div>

          <div class="flex items-center gap-3">
            <input type="checkbox" [(ngModel)]="activo" name="activo" id="activo"
                   class="w-4 h-4 rounded accent-amber-500" />
            <label for="activo" class="text-sm text-gray-300">Beneficio activo</label>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex gap-3">
          <button type="submit" [disabled]="loading"
                  class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50">
            {{ loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear beneficio') }}
          </button>
          <a routerLink="/admin/beneficios"
             class="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  `
})
export class BeneficioFormComponent implements OnInit {
  private readonly beneficioService = inject(BeneficioService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEdit = false;
  editId = '';
  loading = false;

  nombre = '';
  categoria = '';
  icono = '';
  codigo = '';
  activo = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = id;
      this.beneficioService.getById(id).subscribe(b => {
        this.nombre = b.nombre;
        this.categoria = b.categoria;
        this.icono = b.icono;
        this.codigo = b.codigo;
        this.activo = b.activo;
      });
    }
  }

  onSubmit() {
    this.loading = true;
    const data = {
      nombre: this.nombre,
      categoria: this.categoria,
      icono: this.icono,
      codigo: this.codigo,
      activo: this.activo
    };

    const obs = this.isEdit
      ? this.beneficioService.update(this.editId, data)
      : this.beneficioService.create(data);

    obs.subscribe({
      next: () => this.router.navigate(['/admin/beneficios']),
      error: () => this.loading = false
    });
  }
}
