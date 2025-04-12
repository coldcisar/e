
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, ParamMap} from "@angular/router";
import {ArticuloService} from "../../services/articulo.service";
import {ArticuloModelServer} from "../../models/articulo.model";
import {map} from "rxjs/operators";
import {CartService} from "../../services/cart.service";
import { CommonModule } from '@angular/common';
declare let $: any;

@Component({
  selector: 'app-articulo',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './articulo.component.html',
  styleUrls: ['./articulo.component.scss']
})
export class ArticuloComponent implements AfterViewInit, OnInit {

  id_producto?: number;
  articulo:ArticuloModelServer | undefined;
  thumbimages: any[] = [];


  @ViewChild('cantidad', { static: false }) quantityInput!: any;

  constructor(private route: ActivatedRoute,
              private articuloService: ArticuloService,
              private cartService: CartService) {


  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((param: ParamMap) => {
        // @ts-ignore
        return param.params.id;
      })
    ).subscribe(id_producto => {
      this.id_producto = id_producto;
      this.articuloService.getSingleProduct(this.id_producto ??  0).subscribe(arti => {
        this.articulo = arti;
        if (arti.imagen !== null) {
          this.thumbimages = arti.imagen.split(';');
        }

      });
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
    this.cartService.AddProductToCart(id_producto, this.quantityInput.nativeElement.value);
  }

  Increase() {
    let value = parseInt(this.quantityInput.nativeElement.value) || 1;
    value = Math.min(value + 1, this.articulo?.cantidad || 1);
    this.quantityInput.nativeElement.value = value.toString();
  }
  
  Decrease() {
    let value = parseInt(this.quantityInput.nativeElement.value) || 1;
    value = Math.max(value - 1, 1);
    this.quantityInput.nativeElement.value = value.toString();
  }
  
}
