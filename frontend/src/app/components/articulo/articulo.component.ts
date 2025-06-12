
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
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
export class ArticuloComponent implements AfterViewInit, OnInit {

  id_producto?: number;
  articulo:ArticuloModelServer | undefined;
  thumbimages: any[] = [];


  quantity: number = 1;

  constructor(private route: ActivatedRoute,
              private articuloService: ArticuloService,
              private cartService: CartService) {


  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id_producto');
      
      // PRUEBA 1: Verificamos si estamos obteniendo el ID correctamente de la URL.
      console.log('1. ID obtenido de la URL:', id);
  
      if (id) {
        this.articuloService.getSingleProduct(Number(id)).subscribe(data => {
          
          // PRUEBA 2: ¡LA MÁS IMPORTANTE! Vemos el objeto JSON crudo que llega del backend.
          console.log('2. Respuesta COMPLETA del backend:', data);
  
          this.articulo = data;
  
          // PRUEBA 3: Verificamos que la variable del componente fue asignada.
          console.log('3. Variable this.articulo ASIGNADA:', this.articulo);
  
          // Lógica de las imágenes que ya corregimos
          if (this.articulo && this.articulo.imagen) {
            this.thumbimages = this.articulo.imagen.split(';');
          } else {
            this.thumbimages = [];
          }
        });
      }
    });
  }

  ngAfterViewInit(): void {

    // Product Main img Slick
    $('#product-main-img').slick({
      infinite: true,
      speed: 300,
      dots: false,
      arrows: true,
      fade: true,
      asNavFor: '#product-imgs',
    });

    // Product imgs Slick
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

    // Product img zoom
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
