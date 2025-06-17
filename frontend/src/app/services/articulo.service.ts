import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';
import { ArticuloModelServer, serverResponse } from '../models/articulo.model';

@Injectable({
  providedIn: 'root'
})
export class ArticuloService {
  // Cargamos la URL base del backend desde el archivo de entorno
  private SERVER_URL = environment.serverURL;

  constructor(private http: HttpClient) { }

  // Método para obtener todos los productos
  getAllProducts(limitOfResults = 10): Observable<serverResponse> {
    return this.http.get<serverResponse>(`${this.SERVER_URL}/articulos`, {
      params: {
        limit: limitOfResults.toString()
      }
    });
  }

  // Método para obtener un solo producto
  getSingleProduct(id: number): Observable<ArticuloModelServer> {
    return this.http.get<ArticuloModelServer>(`${this.SERVER_URL}/articulos/${id}`);
  }
  
  // Método para buscar productos
  searchProducts(query: string): Observable<ArticuloModelServer[]> {
      return this.http.get<ArticuloModelServer[]>(`${this.SERVER_URL}/articulos/search/${query}`);
  }

  // Método para obtener productos por categoría
  getProductsFromCategory(catName: string, excludeId?: number): Observable<ArticuloModelServer[]> {
    let params = {};
    if (excludeId) {
        params = { exclude: excludeId.toString() };
    }
    // Y le decimos a HttpClient que esperamos ese tipo de dato
    return this.http.get<ArticuloModelServer[]>(`${this.SERVER_URL}/articulos/categoria/${catName}`, { params });
  }

}