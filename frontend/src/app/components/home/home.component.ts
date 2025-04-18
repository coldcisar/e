
import {Component, OnInit} from '@angular/core';
import {ArticuloService} from "../../services/articulo.service";
import {ArticuloModelServer, serverResponse} from "../../models/articulo.model";
import {CartService} from "../../services/cart.service";
import {Router} from "@angular/router";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit {
  products: ArticuloModelServer[] = [];

  constructor(private productService: ArticuloService,
              private cartService: CartService,
              private router:Router) {
  }

  ngOnInit() {
    this.productService.getAllProducts(8).subscribe((prods: serverResponse ) => {
      this.products = prods.products;
      console.log(this.products);
    });
  }

  AddProduct(id: number) {
    this.cartService.AddProductToCart(id);
  }

  selectProduct(id: Number) {
    this.router.navigate(['/articulo', id]).then();
  }
}
