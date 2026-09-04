import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BeneficioRelampago } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class BeneficioRelampagoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/beneficios-relampago';

  getAll(): Observable<BeneficioRelampago[]> {
    return this.http.get<BeneficioRelampago[]>(this.baseUrl);
  }

  getById(id: string): Observable<BeneficioRelampago> {
    return this.http.get<BeneficioRelampago>(`${this.baseUrl}/${id}`);
  }

  create(beneficio: Partial<BeneficioRelampago>): Observable<BeneficioRelampago> {
    return this.http.post<BeneficioRelampago>(this.baseUrl, beneficio);
  }

  update(id: string, beneficio: Partial<BeneficioRelampago>): Observable<BeneficioRelampago> {
    return this.http.put<BeneficioRelampago>(`${this.baseUrl}/${id}`, beneficio);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getVigentes(): Observable<BeneficioRelampago[]> {
    return this.http.get<BeneficioRelampago[]>('/api/publico/beneficios-relampago');
  }
}
