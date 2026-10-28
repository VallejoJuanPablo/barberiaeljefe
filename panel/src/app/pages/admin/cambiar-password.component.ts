import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6 min-h-full">
      <div class="flex items-center gap-4 mb-6">
        <a
          routerLink="/admin/clientes"
          class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <h2 class="text-2xl font-bold text-white">Cambiar contraseña</h2>
          <p class="text-gray-400 text-sm mt-0.5">Modificá la contraseña de tu cuenta</p>
        </div>
      </div>

      <div class="max-w-md">
        <form [formGroup]="form" (ngSubmit)="guardar()" class="space-y-6">

          @if (error()) {
            <div class="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
              {{ error() }}
            </div>
          }

          @if (exito()) {
            <div class="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg">
              {{ exito() }}
            </div>
          }

          <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Contraseña actual <span class="text-red-400">*</span></label>
              <input
                type="password"
                formControlName="passwordActual"
                class="w-full bg-gray-700 border text-white px-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                [class]="campoInvalido('passwordActual') ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-amber-500'"
              />
              @if (campoInvalido('passwordActual')) {
                <p class="mt-1 text-xs text-red-400">Ingresá tu contraseña actual</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Nueva contraseña <span class="text-red-400">*</span></label>
              <input
                type="password"
                formControlName="passwordNueva"
                class="w-full bg-gray-700 border text-white px-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                [class]="campoInvalido('passwordNueva') ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-amber-500'"
              />
              @if (campoInvalido('passwordNueva')) {
                <p class="mt-1 text-xs text-red-400">Mínimo 6 caracteres</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Repetir nueva contraseña <span class="text-red-400">*</span></label>
              <input
                type="password"
                formControlName="passwordRepetir"
                class="w-full bg-gray-700 border text-white px-4 py-2.5 rounded-lg focus:outline-none transition-colors"
                [class]="campoInvalido('passwordRepetir') ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-amber-500'"
              />
              @if (campoInvalido('passwordRepetir')) {
                <p class="mt-1 text-xs text-red-400">Repetí la nueva contraseña</p>
              }
            </div>
          </div>

          <button
            type="submit"
            [disabled]="saving() || form.invalid"
            class="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (saving()) {
              <span class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Guardando...
              </span>
            } @else {
              Cambiar contraseña
            }
          </button>
        </form>
      </div>
    </div>
  `
})
export class CambiarPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  saving = signal(false);
  error = signal<string | null>(null);
  exito = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    passwordActual: ['', Validators.required],
    passwordNueva: ['', [Validators.required, Validators.minLength(6)]],
    passwordRepetir: ['', Validators.required]
  });

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { passwordActual, passwordNueva, passwordRepetir } = this.form.value;

    if (passwordNueva !== passwordRepetir) {
      this.error.set('Las contraseñas nuevas no coinciden');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.exito.set(null);

    this.authService.cambiarPassword(passwordActual, passwordNueva).subscribe({
      next: (res) => {
        this.exito.set(res.mensaje);
        this.form.reset();
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.mensaje || 'Error al cambiar la contraseña');
        this.saving.set(false);
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }
}
