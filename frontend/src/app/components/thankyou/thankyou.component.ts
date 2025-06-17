
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thankyou',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thankyou.component.html',
  styleUrls: ['./thankyou.component.scss']
})
export class ThankyouComponent implements OnInit {

  message: string;
  order_id: number;
  articulos: any[] = [];
  cartTotal: number;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as any;

    // --- CONSOLE LOG DE DEPURACIÓN ---
    console.log("Estado completo recibido de la navegación:", state);

    // Asignamos cada propiedad a su variable
    this.message = state?.message;
    this.order_id = state?.order_id;
    this.articulos = state?.articulos || []; // La asignación que nos interesa
    this.cartTotal = state?.total;
  }

  ngOnInit(): void {
    if (!this.order_id) {
      this.router.navigate(['/']);
    }
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
