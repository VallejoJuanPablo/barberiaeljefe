import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa, Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/empresas';

  getAll(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.baseUrl);
  }

  getById(id: string): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.baseUrl}/${id}`);
  }

  create(empresa: Partial<Empresa>): Observable<Empresa> {
    return this.http.post<Empresa>(this.baseUrl, empresa);
  }

  update(id: string, empresa: Partial<Empresa>): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.baseUrl}/${id}`, empresa);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  registrarPago(id: string): Observable<{ mensaje: string; empresa: Empresa }> {
    return this.http.put<{ mensaje: string; empresa: Empresa }>(`${this.baseUrl}/${id}/pago`, {});
  }

  suspender(id: string): Observable<{ mensaje: string; empresa: Empresa }> {
    return this.http.put<{ mensaje: string; empresa: Empresa }>(`${this.baseUrl}/${id}/suspender`, {});
  }

  getEmpleados(id: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/${id}/empleados`);
  }
}
