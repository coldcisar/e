
import {AfterViewInit, Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute, ParamMap, RouterModule} from "@angular/router";
import {ArticuloService} from "../../services/articulo.service";
import {ArticuloModelServer} from "../../models/articulo.model";
import {map} from "rxjs/operators";
import {CartService} from "../../services/cart.service";
import { CommonModule } from '@angular/common';
declare let $: any;

@Component({
  selector: 'app-articulo',
  standalone:true,
  imports:[CommonModule,RouterModule],
  templateUrl: './articulo.component.html',
  styleUrls: ['./articulo.component.scss']
})

export class ArticuloComponent implements OnInit, AfterViewInit {
  articulo: ArticuloModelServer | undefined;
  thumbimages: any[] = [];
  quantity: number = 1;

  relatedProducts: ArticuloModelServer[] = [];

  constructor(
    private route: ActivatedRoute,
    private articuloService: ArticuloService,
    private cartService: CartService,
    private cdr:ChangeDetectorRef
  ) { }




  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
  
    const id = params.get('id_producto');

    if (id) {
      this.articuloService.getSingleProduct(Number(id)).subscribe({
        next: (product) => {
          this.articulo = product;
          console.log('ÉXITO: Datos del producto principal cargado:', this.articulo);

          if (product && product.categoria) {
            this.articuloService.getProductsFromCategory(product.categoria, product.id_producto)
    .subscribe(related => { 

     
      this.relatedProducts = related;
    });

          } else {
            console.warn('El producto cargado no tiene una propiedad "categoria".');
          }
        },
        error: (err) => {
          console.error('ERROR al obtener el producto principal:', err);
        }
      });
    }
  });
}

  ngAfterViewInit(): void {

    
    $('#product-main-img').slick({
      infinite: true,
      speed: 300,
      dots: false,
      arrows: true,
      fade: true,
      asNavFor: '#product-imgs',
    });

    $('#product-imgs').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: true,
      centerMode: true,
      focusOnSelect: true,
      centerPadding: 0,
      vertical: true,
      asNavFor: '#product-main-img',
      responsive: [{
        breakpoint: 991,
        settings: {
          vertical: false,
          arrows: false,
          dots: true,
        }
      },
      ]
    });

   
    var zoomMainProduct = document.getElementById('product-main-img');
    if (zoomMainProduct) {
      $('#product-main-img .product-preview').zoom();
    }
  }

  addToCart(id_producto: number) {
    this.cartService.AddProductToCart(id_producto, this.quantity);
  }
  

  Increase() {
    const maxStock = this.articulo?.cantidad || 1;
    if (this.quantity < maxStock) {
      this.quantity++;
    }
  }
  
  Decrease() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
}
