import {Component, OnInit} from '@angular/core';
import {CartService} from "../../services/cart.service";
import {CartModelServer} from "../../models/cart.model";
import {Router, RouterModule} from "@angular/router";
import {OrderService} from "../../services/order.service";
import {NgxSpinnerModule, NgxSpinnerService} from "ngx-spinner";
import {FormBuilder, NgForm, Validators} from "@angular/forms";
import { CommonModule } from '@angular/common';
import { ArticuloModelServer } from '../../models/articulo.model';
import { UserService } from '../../services/user.service';
import { SocialUser } from '@abacritt/angularx-social-login';
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
  private userId: number | undefined;

  constructor(private cartService: CartService,
              private orderService: OrderService,
              private router: Router,
              private userService:UserService,
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
    // --- PASO 3: Obtenemos el ID del usuario actual al cargar el componente ---
    this.userService.userData$.subscribe(data => {
      // 'data' puede ser de tipo SocialUser (Google) o ResponseModel (tu backend)
      if (data) {
        // Verificamos si tiene la propiedad 'id' (de SocialUser) o 'userId' (de tu ResponseModel)
        this.userId = (data as SocialUser).id ? Number((data as SocialUser).id) : (data as any).userId;
      }
    });
  }

  onCheckout() {
    if (!this.userId) {
      console.error("No se puede hacer checkout: ID de usuario no encontrado.");
      return;
    }

    this.spinner.show().then(p => {
      // --- PASO 4: Usamos el ID del usuario actual, no uno fijo ---
      this.cartService.CheckoutFromCart(this.userId!);
    });
  }
    





// Esta función calcula el subtotal de forma segura
calculateSubtotal(precio: string, cantidad: number): number {
  // Convierte el precio de string a número y lo multiplica por la cantidad
  return Number(precio) * cantidad;
}
}