import {Component, OnInit} from '@angular/core';
import {CartService} from "../../services/cart.service";
import {CartModelServer} from "../../models/cart.model";
import { CommonModule } from '@angular/common';
import { RouterModule, } from '@angular/router';
import { UserService } from '../../services/user.service'; 
import { FormsModule,NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-headers',
  standalone:true,
  imports:[CommonModule,RouterModule,FormsModule],
  templateUrl: './headers.component.html',
  styleUrls: ['./headers.component.scss']
})
export class HeadersComponent implements OnInit {
  cartData!: CartModelServer;
  cartTotal!: number;
  
  authState: boolean = false;

  constructor(
    public cartService: CartService,
    public userService: UserService,
    private router: Router 
  ) {
  }

  ngOnInit() : void {
    this.cartService.cartTotal$.subscribe(total => {
      this.cartTotal = total;
    });

    this.cartService.cartDataObs$.subscribe(data => this.cartData = data);
    
    // Ahora esta línea funcionará porque this.userService existe
    this.userService.authState$.subscribe(authState => this.authState = authState);
  }

  // Para que el botón de logout funcione
  logout() {
    this.userService.logout();
  }
  onSearch(form: NgForm) {
    if (form.valid) {
      const query = form.value.query;
      this.router.navigate(['/search', query]);
    }
    }  
  }