
import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environment/environment";
import {Observable} from "rxjs";
import {ArticuloModelServer, serverResponse} from "../models/articulo.model";

@Injectable({
  providedIn: 'root'
})
export class ArticuloService {
  private url = environment.serverURL;

  constructor(private http: HttpClient) {
  }

  getAllProducts(limitOfResults=10): Observable<serverResponse> {
    return this.http.get<serverResponse>(this.url + 'articulos', {
      params: {
        limit: limitOfResults.toString()
      }
    });
  }

  getSingleProduct(id_producto: Number): Observable<ArticuloModelServer> {
    return this.http.get<ArticuloModelServer>(this.url + 'articulos/' + id_producto);
  }

  getProductsFromCategory(nombre_categoria: String): Observable<ArticuloModelServer[]> {
    return this.http.get<ArticuloModelServer[]>(this.url + 'articulos/categoria/' + nombre_categoria);
  }

}
