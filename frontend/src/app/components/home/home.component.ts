
import {Component, OnInit} from '@angular/core';
import {ArticuloService} from "../../services/articulo.service";
import {ArticuloModelServer, serverResponse} from "../../models/articulo.model";
import { CartService } from '../../services/cart.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit {
  articulos: ArticuloModelServer[] = [];

  constructor(private articuloService: ArticuloService,
              private cartService: CartService,
              private router:Router) {
  }

  ngOnInit() {
    this.articuloService.getAllProducts(8).subscribe((arts: serverResponse ) => {
      this.articulos = arts.articulo;
      console.log(this.articulos);
    });
  }

  AddProduct(id_producto: number) {
    this.cartService.AddProductToCart(id_producto);
  }

  selectProduct(id_producto: Number) {
    this.router.navigate(['/articulo', id_producto]).then();
  }
}
