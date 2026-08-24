import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Membresia } from '../models/cliente.model';

export interface MembresiaPayload {
  nombre: string;
  precio: number;
  incluye: string[];
  beneficios: string[]; // IDs de beneficios
  descripcion: string;
  activa: boolean;
}

@Injectable({ providedIn: 'root' })
export class MembresiaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/membresias';

  getAll(): Observable<Membresia[]> {
    return this.http.get<Membresia[]>(this.baseUrl);
  }

  getById(id: string): Observable<Membresia> {
    return this.http.get<Membresia>(`${this.baseUrl}/${id}`);
  }

  create(membresia: Partial<MembresiaPayload>): Observable<Membresia> {
    return this.http.post<Membresia>(this.baseUrl, membresia);
  }

  update(id: string, membresia: Partial<MembresiaPayload>): Observable<Membresia> {
    return this.http.put<Membresia>(`${this.baseUrl}/${id}`, membresia);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
