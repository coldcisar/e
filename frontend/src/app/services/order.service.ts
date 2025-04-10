
import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environment/environment";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  articulos: ArticuloResponseModel[] = [];
  ServerURL = environment.serverURL;

  constructor(private http: HttpClient) {
  }


  getSingleOrder(order_id: Number) {
    return this.http.get<ArticuloResponseModel[]>(`${this.ServerURL}ordenes/${order_id}`).toPromise();
  }
}

interface ArticuloResponseModel {
  id_producto: Number;
  nombre_producto: String;
  descripcion: String;
  precio: Number;
  cantidadOrdenada: Number;
  imagen: String;
}
