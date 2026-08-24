import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Beneficio } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class BeneficioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/beneficios';

  getAll(): Observable<Beneficio[]> {
    return this.http.get<Beneficio[]>(this.baseUrl);
  }

  getById(id: string): Observable<Beneficio> {
    return this.http.get<Beneficio>(`${this.baseUrl}/${id}`);
  }

  create(beneficio: Partial<Beneficio>): Observable<Beneficio> {
    return this.http.post<Beneficio>(this.baseUrl, beneficio);
  }

  update(id: string, beneficio: Partial<Beneficio>): Observable<Beneficio> {
    return this.http.put<Beneficio>(`${this.baseUrl}/${id}`, beneficio);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
