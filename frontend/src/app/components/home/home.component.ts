
import {Component, OnInit} from '@angular/core';
import {ArticuloService} from "../../services/articulo.service";
import {ArticuloModelServer, serverResponse} from "../../models/articulo.model";
import { CartService } from '../../services/cart.service';
import {Router} from "@angular/router";
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone:true,
  imports:[CommonModule,HttpClientModule],
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
      this.articulos = arts.articulos;
      console.log(this.articulos);
    });
  }

  AddProduct(id_producto?: number) {
    this.cartService.AddProductToCart(id_producto?? 0);
  }

  selectProduct(id_producto: number) {
    this.router.navigate(['/articulos', id_producto]).then();
  }
}
