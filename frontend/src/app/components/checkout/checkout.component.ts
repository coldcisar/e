import {Component, OnInit} from '@angular/core';
import {CartService} from "../../services/cart.service";
import {CartModelServer} from "../../models/cart.model";
import {Router, RouterModule} from "@angular/router";
import {OrderService} from "../../services/order.service";
import {NgxSpinnerModule, NgxSpinnerService} from "ngx-spinner";
import {FormBuilder, NgForm, Validators} from "@angular/forms";
import { CommonModule } from '@angular/common';
import { ArticuloModelServer } from '../../models/articulo.model';

@Component({
  selector: 'app-checkout',
  standalone:true,
  imports:[CommonModule,NgxSpinnerModule,RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  articulos: ArticuloModelServer[] = [];
  cartData!: CartModelServer;
  cartTotal!: number;
  showSpinner!: Boolean;
  checkoutForm: any;
  constructor(private cartService: CartService,
              private orderService: OrderService,
              private router: Router,
              private  spinner: NgxSpinnerService,
              private fb: FormBuilder) {

    this.checkoutForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],

    });


  }

  ngOnInit() {
    this.cartService.cartDataObs$.subscribe(data => this.cartData = data);
    this.cartService.cartTotal$.subscribe(total => this.cartTotal = total);

  }

  onCheckout() {
   this.spinner.show().then(p => {
      this.cartService.CheckoutFromCart(204340056);
    });
    


  //console.log(this.checkoutForm.value);

  }
  // ... dentro de la clase CheckoutComponent ...

// Esta función calcula el subtotal de forma segura
calculateSubtotal(precio: string, cantidad: number): number {
  // Convierte el precio de string a número y lo multiplica por la cantidad
  return Number(precio) * cantidad;
}
}