
import {Injectable} from '@angular/core';
import {ArticuloService} from "./articulo.service";
import {BehaviorSubject} from "rxjs";
import {CartModelPublic, CartModelServer} from "../models/cart.model";
import {ArticuloModelServer} from "../models/articulo.model";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environment/environment";
import {NavigationExtras, Router} from "@angular/router";
import {OrderService} from "./order.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})


export class CartService {

  ServerURL = environment.serverURL;

  private cartDataClient: CartModelPublic = {ArtData: [{incart: 0, id_producto: 0}], total: 0};  // This will be sent to the backend Server as post data
  // Cart Data variable to store the cart information on the server
  private cartDataServer: CartModelServer = {
    data: [{
      articulo: undefined,
      numInCart: 0
    }],
    total: 0
  };

  cartTotal$ = new BehaviorSubject<number>(0);
  // Data variable to store the cart information on the client's local storage

  cartDataObs$ = new BehaviorSubject<CartModelServer>(this.cartDataServer);


  constructor(private ArticuloService: ArticuloService,
              private orderService: OrderService,
              private httpClient: HttpClient,
              private router: Router,
              private spinner: NgxSpinnerService,
              private toast: ToastrService) {

    this.cartTotal$.next(this.cartDataServer.total);
    this.cartDataObs$.next(this.cartDataServer);

    let info: CartModelPublic = JSON.parse(localStorage.getItem('cart') ??'{}');

    if (info && Array.isArray(info.ArtData) && info.ArtData.length > 0 && info.ArtData[0].incart !== 0){
      // assign the value to our data variable which corresponds to the LocalStorage data format
      this.cartDataClient = info;
      // Loop through each entry and put it in the cartDataServer object
      this.cartDataClient.ArtData.forEach(a => {
        this.ArticuloService.getSingleProduct(a.id_producto).subscribe((actualArtInfo: ArticuloModelServer) => {
          if (this.cartDataServer.data[0].numInCart === 0) {
            this.cartDataServer.data[0].numInCart = a.incart;
            this.cartDataServer.data[0].articulo = actualArtInfo;
            this.CalculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          } else {
            this.cartDataServer.data.push({
              numInCart: a.incart,
              articulo: actualArtInfo
            });
            this.CalculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
          this.cartDataObs$.next({...this.cartDataServer});
        });
      });
    }
  }

  CalculateSubTotal(index:number): number {
    let subTotal = 0;

    let a = this.cartDataServer.data[index];
    // @ts-ignore
    subTotal = a.articulo.precio * a.numInCart;

    

    return subTotal;
  }

  AddProductToCart(id_producto: number, cantidad?: number) {

    this.ArticuloService.getSingleProduct(id_producto).subscribe(arti => {
      // If the cart is empty
      if (this.cartDataServer.data[0].articulo === undefined) {
        this.cartDataServer.data[0].articulo = arti;
        this.cartDataServer.data[0].numInCart = cantidad !== undefined ? cantidad : 1;
        this.CalculateTotal();
        this.cartDataClient.ArtData[0].incart = this.cartDataServer.data[0].numInCart;
        this.cartDataClient.ArtData[0].id_producto = arti.id_producto;
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartDataObs$.next({...this.cartDataServer});
        this.toast.success(`${arti.nombre_producto} added to the cart.`, "Product Added", {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        })
      }  // END of IF
      // Cart is not empty
      else {
        let index = this.cartDataServer.data.findIndex(a => a.articulo?.id_producto === arti.id_producto);

        // 1. If chosen product is already in cart array
        if (index !== -1) {

          if (cantidad !== undefined && cantidad <= arti.cantidad) {
            // @ts-ignore
            this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < arti.cantidad ? cantidad : arti.cantidad;
          } else {
            // @ts-ignore
            this.cartDataServer.data[index].numInCart < arti.cantidad ? this.cartDataServer.data[index].numInCart++ : arti.cantidad;
          }


          this.cartDataClient.ArtData[index].incart = this.cartDataServer.data[index].numInCart;
          this.toast.info(`${arti.nombre_producto} quantity updated in the cart.`, "Product Updated", {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          })
        }
        // 2. If chosen product is not in cart array
        else {
          this.cartDataServer.data.push({
            articulo: arti,
            numInCart: 1
          });
          this.cartDataClient.ArtData.push({
            incart: 1,
            id_producto: arti.id_producto
          });
          this.toast.success(`${arti.nombre_producto} added to the cart.`, "Product Added", {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          })
        }
        this.CalculateTotal();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartDataObs$.next({...this.cartDataServer});
      }  // END of ELSE


    });
  }

  UpdateCartData(index:number, increase: Boolean) {
    let data = this.cartDataServer.data[index];
    if (increase) {
      // @ts-ignore
      data.numInCart < data.articulo.cantidad ? data.numInCart++ : data.articulo.cantidad;
      this.cartDataClient.ArtData[index].incart = data.numInCart;
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;
      this.cartDataObs$.next({...this.cartDataServer});
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
    } else {
      // @ts-ignore
      data.numInCart--;

      // @ts-ignore
      if (data.numInCart < 1) {
        this.DeleteProductFromCart(index);
        this.cartDataObs$.next({...this.cartDataServer});
      } else {
        // @ts-ignore
        this.cartDataObs$.next({...this.cartDataServer});
        this.cartDataClient.ArtData[index].incart = data.numInCart;
        this.CalculateTotal();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }

    }

  }

  DeleteProductFromCart(index:number) {
    /*    console.log(this.cartDataClient.prodData[index].prodId);
        console.log(this.cartDataServer.data[index].product.id);*/

    if (window.confirm('Are you sure you want to delete the item?')) {
      this.cartDataServer.data.splice(index, 1);
      this.cartDataClient.ArtData.splice(index, 1);
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;

      if (this.cartDataClient.total === 0) {
        this.cartDataClient = {ArtData: [{incart: 0, id_producto: 0}], total: 0};
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      } else {
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }

      if (this.cartDataServer.total === 0) {
        this.cartDataServer = {
          data: [{
            articulo: undefined,
            numInCart: 0
          }],
          total: 0
        };
        this.cartDataObs$.next({...this.cartDataServer});
      } else {
        this.cartDataObs$.next({...this.cartDataServer});
      }
    }
    // If the user doesn't want to delete the product, hits the CANCEL button
    else {
      return;
    }


  }

  CheckoutFromCart(user_id: number) {

    this.httpClient.post<{success:boolean}>(`${this.ServerURL}ordenes/pago`, null).subscribe((res: { success: boolean }) => {
      console.clear();

      if (res.success) {


        this.resetServerData();
        this.httpClient.post<OrderConfirmationResponse>(`${this.ServerURL}ordenes/nuevo`, {
          user_id: user_id,
          articulo: this.cartDataClient.ArtData
        }).subscribe((data: OrderConfirmationResponse) => {

          this.orderService.getSingleOrder(data.order_id).then(arti => {
            if (data.success) {
              const navigationExtras: NavigationExtras = {
                state: {
                  message: data.message,
                  articulos: arti,
                  order_id: data.order_id,
                  total: this.cartDataClient.total
                }
              };
              this.spinner.hide().then();
              this.router.navigate(['/thankyou'], navigationExtras).then(p => {
                this.cartDataClient = {ArtData: [{incart: 0, id_producto: 0}], total: 0};
                this.cartTotal$.next(0);
                localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
              });
            }
          });

        })
      } else {
        this.spinner.hide().then();
        this.router.navigateByUrl('/checkout').then();
        this.toast.error(`Sorry, failed to book the order`, "Order Status", {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        })
      }
    })
  }


  private CalculateTotal() {
    let Total = 0;

    this.cartDataServer.data.forEach(a => {
      const {numInCart} = a;
      const {precio} = a.articulo!;
      // @ts-ignore
      Total += numInCart * precio;
    });
    this.cartDataServer.total = Total;
    this.cartTotal$.next(this.cartDataServer.total);
  }


  private resetServerData() {
    this.cartDataServer = {
      data: [{
        articulo: undefined,
        numInCart: 0
      }],
      total: 0
    };
    this.cartDataObs$.next({...this.cartDataServer});
  }

}

interface OrderConfirmationResponse {
  order_id: number;
  success: boolean;
  message: string;
  articulo: {
    id_producto: string,
    numInCart: string
  }[];
}
