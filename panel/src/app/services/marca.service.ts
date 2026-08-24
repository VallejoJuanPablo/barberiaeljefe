import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Marca } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/marcas';

  getAll(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.baseUrl);
  }

  getById(id: string): Observable<Marca> {
    return this.http.get<Marca>(`${this.baseUrl}/${id}`);
  }

  create(formData: FormData): Observable<Marca> {
    return this.http.post<Marca>(this.baseUrl, formData);
  }

  update(id: string, formData: FormData): Observable<Marca> {
    return this.http.put<Marca>(`${this.baseUrl}/${id}`, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getPublicas(): Observable<Marca[]> {
    return this.http.get<Marca[]>('/api/publico/marcas');
  }
}
