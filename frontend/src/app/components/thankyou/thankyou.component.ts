
import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {OrderService} from "../../services/order.service";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thankyou',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './thankyou.component.html',
  styleUrls: ['./thankyou.component.scss']
})
export class ThankyouComponent implements OnInit {
  message!: string;
  order_id!: number;
  articulos;
  cartTotal;
  constructor(private router: Router,
    private orderService: OrderService) {
    const state = this.router.getCurrentNavigation()?.extras?.state as {
    message: string,
    articulos: ArticuloResponseModel[],
    order_id: number,
    total: number
    } | undefined;

    if (state) {
      this.message = state.message;
      this.order_id = state.order_id;
      this.articulos = state.articulos;
      this.cartTotal = state.total;
      console.log(this.articulos);
    } else {
    // Si el usuario llegó a esta página sin pasar datos, lo redirigimos
    this.router.navigateByUrl('/');
  }
  }


  ngOnInit() {

  }

}

interface ArticuloResponseModel {
  id: number;
  nombre_producto: string;
  descripcion: string;
  precio: number;
  cantidadOrdenada: number;
  imagen: string;
}
