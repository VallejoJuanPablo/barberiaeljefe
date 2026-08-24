import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MarcaService } from '../../../services/marca.service';

@Component({
  selector: 'app-marca-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="p-6 max-w-2xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <a routerLink="/admin/marcas"
           class="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-white">{{ isEdit ? 'Editar' : 'Nueva' }} marca</h1>
      </div>

      <form (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Datos de la marca</h2>

          <div>
            <label class="block text-sm text-gray-300 mb-1">Nombre</label>
            <input type="text" [(ngModel)]="nombre" name="nombre" required
                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                   placeholder="Ej: Panter Gym" />
          </div>

          <div>
            <label class="block text-sm text-gray-300 mb-1">Logo <span class="text-gray-500">(URL de imagen)</span></label>
            <input type="text" [(ngModel)]="logo" name="logo"
                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                   placeholder="https://ejemplo.com/logo.png" />
            @if (logo) {
              <div class="mt-3 flex items-center gap-3">
                <img [src]="logo" alt="Preview" class="w-16 h-16 rounded-lg object-contain bg-white p-1.5" />
                <span class="text-xs text-gray-500">Preview del logo</span>
              </div>
            }
          </div>

          <div>
            <label class="block text-sm text-gray-300 mb-1">Instagram</label>
            <input type="text" [(ngModel)]="instagram" name="instagram"
                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                   placeholder="@pantergym o https://instagram.com/pantergym" />
            <p class="text-xs text-gray-500 mt-1">Puede ser el &#64; o la URL completa</p>
          </div>

          <div>
            <label class="block text-sm text-gray-300 mb-1">Orden <span class="text-gray-500">(menor = primero)</span></label>
            <input type="number" [(ngModel)]="orden" name="orden"
                   class="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                   placeholder="0" />
          </div>

          <div class="flex items-center gap-3">
            <input type="checkbox" [(ngModel)]="activa" name="activa" id="activa"
                   class="w-4 h-4 rounded accent-amber-500" />
            <label for="activa" class="text-sm text-gray-300">Marca activa</label>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex gap-3">
          <button type="submit" [disabled]="loading"
                  class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50">
            {{ loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear marca') }}
          </button>
          <a routerLink="/admin/marcas"
             class="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  `
})
export class MarcaFormComponent implements OnInit {
  private readonly marcaService = inject(MarcaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isEdit = false;
  editId = '';
  loading = false;

  nombre = '';
  logo = '';
  instagram = '';
  orden = 0;
  activa = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = id;
      this.marcaService.getById(id).subscribe(m => {
        this.nombre = m.nombre;
        this.logo = m.logo;
        this.instagram = m.instagram;
        this.orden = m.orden;
        this.activa = m.activa;
      });
    }
  }

  onSubmit() {
    this.loading = true;
    const data = {
      nombre: this.nombre,
      logo: this.logo,
      instagram: this.instagram,
      orden: this.orden,
      activa: this.activa
    };

    const obs = this.isEdit
      ? this.marcaService.update(this.editId, data)
      : this.marcaService.create(data);

    obs.subscribe({
      next: () => this.router.navigate(['/admin/marcas']),
      error: () => {
        this.loading = false;
        alert('Error al guardar. Verificá los datos e intentá de nuevo.');
      }
    });
  }
}
