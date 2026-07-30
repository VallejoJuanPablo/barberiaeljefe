import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div class="w-full max-w-sm">
        <!-- Logo -->
        <div class="text-center mb-8">
          <span class="text-5xl">✂️</span>
          <h1 class="text-2xl font-bold text-amber-400 mt-3">Barbería El Jefe</h1>
          <p class="text-gray-400 text-sm mt-1">Panel de administración</p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onLogin()" class="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
          <div>
            <label class="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
              placeholder="admin@eljefenegocios.com.ar"
            />
          </div>

          <div>
            <label class="block text-sm text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
              placeholder="••••••••"
            />
          </div>

          @if (error) {
            <p class="text-red-400 text-sm text-center">{{ error }}</p>
          }

          <button
            type="submit"
            [disabled]="loading"
            class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  error = '';
  loading = false;

  onLogin(): void {
    this.error = '';
    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }
}
