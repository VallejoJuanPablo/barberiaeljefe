import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin/clientes',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
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
      }
    ]
  },
  {
    path: 'consulta',
    loadComponent: () =>
      import('./pages/publico/membresia-check.component').then(m => m.MembresiaCheckComponent)
  }
];
