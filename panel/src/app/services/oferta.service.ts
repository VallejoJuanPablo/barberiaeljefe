import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OfertaRelampago } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class OfertaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/ofertas';

  getAll(): Observable<OfertaRelampago[]> {
    return this.http.get<OfertaRelampago[]>(this.baseUrl);
  }

  getById(id: string): Observable<OfertaRelampago> {
    return this.http.get<OfertaRelampago>(`${this.baseUrl}/${id}`);
  }

  create(oferta: Partial<OfertaRelampago>): Observable<OfertaRelampago> {
    return this.http.post<OfertaRelampago>(this.baseUrl, oferta);
  }

  update(id: string, oferta: Partial<OfertaRelampago>): Observable<OfertaRelampago> {
    return this.http.put<OfertaRelampago>(`${this.baseUrl}/${id}`, oferta);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getVigentes(): Observable<OfertaRelampago[]> {
    return this.http.get<OfertaRelampago[]>('/api/publico/ofertas');
  }
}
