import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, Membresia, MembresiaCheck } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/clientes`);
  }

  getById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/clientes/${id}`);
  }

  create(cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/clientes`, cliente);
  }

  update(id: string, cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/clientes/${id}`, cliente);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clientes/${id}`);
  }

  getDeleted(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/clientes`, { params: { deleted: 'true' } });
  }

  restore(id: string): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/clientes/${id}/restore`, {});
  }

  checkMembresia(codigo: string): Observable<MembresiaCheck> {
    return this.http.get<MembresiaCheck>(`${this.baseUrl}/publico/membresia`, { params: { codigo } });
  }

  getPlanes(): Observable<Membresia[]> {
    return this.http.get<Membresia[]>(`${this.baseUrl}/publico/planes`);
  }

  getLogs(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/clientes/${id}/logs`);
  }
}
