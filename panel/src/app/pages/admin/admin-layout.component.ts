import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-900 text-white">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-700">
          <div class="flex items-center gap-3">
            <span class="text-3xl">✂️</span>
            <div>
              <h1 class="text-xl font-bold text-amber-400">Barbería</h1>
              <p class="text-xs text-gray-400 uppercase tracking-widest">El Jefe</p>
            </div>
          </div>
        </div>

        <!-- Nav -->
        <nav class="flex-1 p-4 space-y-1">
          <a
            routerLink="/admin/clientes"
            routerLinkActive="bg-amber-500 text-gray-900 font-semibold"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Clientes</span>
          </a>
          <a
            routerLink="/admin/membresias"
            routerLinkActive="bg-amber-500 text-gray-900 font-semibold"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Membresías</span>
          </a>
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-700 space-y-2">
          <p class="text-xs text-gray-500 text-center">{{ authService.getUsuario()?.nombre }}</p>
          <button
            (click)="authService.logout()"
            class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 overflow-auto">
        <router-outlet />
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  readonly authService = inject(AuthService);
}
