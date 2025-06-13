import {Component, OnInit} from '@angular/core';
import {CartService} from "../../services/cart.service";
import {CartModelServer} from "../../models/cart.model";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service'; // La importación ya estaba bien

@Component({
  selector: 'app-headers',
  standalone:true,
  imports:[CommonModule,RouterModule],
  templateUrl: './headers.component.html',
  styleUrls: ['./headers.component.scss']
})
export class HeadersComponent implements OnInit {
  cartData!: CartModelServer;
  cartTotal!: number;
  // --- MEJORA: Inicializa la propiedad con un valor por defecto ---
  authState: boolean = false;

  constructor(
    public cartService: CartService,
    // --- CORRECCIÓN CRÍTICA: Inyecta el UserService aquí ---
    public userService: UserService
  ) {
  }

  ngOnInit() : void {
    // Estas suscripciones ya estaban bien
    this.cartService.cartTotal$.subscribe(total => {
      this.cartTotal = total;
    });

    this.cartService.cartDataObs$.subscribe(data => this.cartData = data);
    
    // Ahora esta línea funcionará porque this.userService existe
    this.userService.authState$.subscribe(authState => this.authState = authState);
  }

  // --- FUNCIÓN ADICIONAL RECOMENDADA ---
  // Para que el botón de logout funcione
  logout() {
    this.userService.logout();
  }

}