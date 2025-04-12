
import {Component, OnInit} from '@angular/core';
import {CartService} from "../../services/cart.service";
import {CartModelServer} from "../../models/cart.model";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-headers',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './headers.component.html',
  styleUrls: ['./headers.component.scss']
})
export class HeadersComponent implements OnInit {
  cartData!: CartModelServer;
  cartTotal!: number;

  constructor(public cartService: CartService) {
  }

  ngOnInit() {
  this.cartService.cartTotal$.subscribe(total => {
    this.cartTotal = total;
  });

  this.cartService.cartDataObs$.subscribe(data => this.cartData = data);
  }

}
