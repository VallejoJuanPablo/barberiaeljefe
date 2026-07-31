import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin/clientes',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'clientes',
        pathMatch: 'full'
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./pages/admin/clientes/cliente-list.component').then(m => m.ClienteListComponent)
      },
      {
        path: 'clientes/nuevo',
        loadComponent: () =>
          import('./pages/admin/clientes/cliente-form.component').then(m => m.ClienteFormComponent)
      },
      {
        path: 'clientes/:id',
        loadComponent: () =>
          import('./pages/admin/clientes/cliente-form.component').then(m => m.ClienteFormComponent)
      },
      {
        path: 'membresias',
        loadComponent: () =>
          import('./pages/admin/membresias/membresia-list.component').then(m => m.MembresiaListComponent)
      },
      {
        path: 'membresias/nueva',
        loadComponent: () =>
          import('./pages/admin/membresias/membresia-form.component').then(m => m.MembresiaFormComponent)
      },
      {
        path: 'membresias/:id',
        loadComponent: () =>
          import('./pages/admin/membresias/membresia-form.component').then(m => m.MembresiaFormComponent)
      }
    ]
  },
  {
    path: 'consulta_membresia',
    loadComponent: () =>
      import('./pages/publico/membresia-check.component').then(m => m.MembresiaCheckComponent)
  }
];
