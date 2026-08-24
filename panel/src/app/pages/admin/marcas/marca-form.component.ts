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

          <!-- Logo upload -->
          <div>
            <label class="block text-sm text-gray-300 mb-1">Logo</label>
            <div class="flex items-start gap-4">
              <!-- Preview -->
              <div class="flex-shrink-0">
                @if (logoPreview || logoActual) {
                  <img [src]="logoPreview || logoActual" alt="Logo"
                       class="w-20 h-20 rounded-xl object-contain bg-white p-2" />
                } @else {
                  <div class="w-20 h-20 rounded-xl bg-gray-700 flex items-center justify-center">
                    <span class="text-3xl text-gray-500">🏷️</span>
                  </div>
                }
              </div>

              <!-- Input -->
              <div class="flex-1">
                <label
                  class="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-600 hover:border-amber-500/50 cursor-pointer transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm">{{ archivoSeleccionado ? archivoSeleccionado.name : 'Elegir imagen' }}</span>
                  <input type="file" accept="image/*" (change)="onFileSelected($event)" class="hidden" />
                </label>
                <p class="text-xs text-gray-500 mt-1.5">JPG, PNG, WebP o SVG. Máximo 5MB.</p>
                @if (logoActual && !archivoSeleccionado) {
                  <p class="text-xs text-amber-400/60 mt-1">Logo actual guardado</p>
                }
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-300 mb-1">Instagram</label>
            <input type="text" [(ngModel)]="instagram" name="instagram"
                   class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                   placeholder="&#64;pantergym o https://instagram.com/pantergym" />
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
  instagram = '';
  orden = 0;
  activa = true;

  logoActual = '';
  logoPreview = '';
  archivoSeleccionado: File | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = id;
      this.marcaService.getById(id).subscribe(m => {
        this.nombre = m.nombre;
        this.logoActual = m.logo;
        this.instagram = m.instagram;
        this.orden = m.orden;
        this.activa = m.activa;
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.archivoSeleccionado = file;

    // Preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      this.logoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    this.loading = true;

    const formData = new FormData();
    formData.append('nombre', this.nombre);
    formData.append('instagram', this.instagram);
    formData.append('orden', String(this.orden));
    formData.append('activa', String(this.activa));

    if (this.archivoSeleccionado) {
      formData.append('logo', this.archivoSeleccionado);
    }

    const obs = this.isEdit
      ? this.marcaService.update(this.editId, formData)
      : this.marcaService.create(formData);

    obs.subscribe({
      next: () => this.router.navigate(['/admin/marcas']),
      error: () => {
        this.loading = false;
        alert('Error al guardar. Verificá los datos e intentá de nuevo.');
      }
    });
  }
}
