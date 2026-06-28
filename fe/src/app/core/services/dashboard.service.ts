import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CertificationEntry, CreateCertificationPayload, EmployeeItem } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  getEmployees(token: string): Observable<EmployeeItem[]> {
    return this.http.get<{ success: boolean; data: EmployeeItem[] }>(
      `${this.apiUrl}/inspectors`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    ).pipe(
      map(response => response.data || [])
    );
  }

  createCertification(token: string, payload: CreateCertificationPayload): Observable<CertificationEntry> {
    return this.http
      .post<{ success: boolean; data: CertificationEntry }>(`${this.apiUrl}/certifications`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .pipe(map(response => response.data));
  }
}
