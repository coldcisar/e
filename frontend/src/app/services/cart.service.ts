
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

  // En tu archivo cart.service.ts

AddProductToCart(id_producto: number, cantidad?: number) {
  this.ArticuloService.getSingleProduct(id_producto).subscribe(arti => {
    const selectedQuantity = cantidad !== undefined ? cantidad : 1;

    let index = this.cartDataServer.data.findIndex(p => p.articulo?.id_producto === id_producto);

    if (index !== -1) {
      // Actualizamos la cantidad del producto existente.
      this.cartDataServer.data[index].numInCart = selectedQuantity;
      this.cartDataClient.ArtData[index].incart = selectedQuantity;
      this.toast.info(`${arti.nombre_producto} quantity updated in the cart.`, "Product Updated");

    } else {
      // Verificamos si el carrito está en su estado inicial (vacío)
      if (this.cartDataServer.data[0].articulo === undefined) {
        // Usamos el primer elemento del array que está vacío
        this.cartDataServer.data[0] = { articulo: arti, numInCart: selectedQuantity };
        this.cartDataClient.ArtData[0] = { incart: selectedQuantity, id_producto: arti.id_producto };
      } else {
        // Si no está vacío, añadimos el nuevo producto al final
        this.cartDataServer.data.push({ articulo: arti, numInCart: selectedQuantity });
        this.cartDataClient.ArtData.push({ incart: selectedQuantity, id_producto: arti.id_producto });
      }
      this.toast.success(`${arti.nombre_producto} added to the cart.`, "Product Added");
    }

    // Finalmente, recalculamos todo y guardamos
    this.CalculateTotal();
    this.cartDataClient.total = this.cartDataServer.total;
    localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
    this.cartDataObs$.next({ ...this.cartDataServer });
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
        // ...
this.httpClient.post<OrderConfirmationResponse>(`${this.ServerURL}ordenes/nuevo`, {
  userId: user_id,
  articulos: this.cartDataClient.ArtData
})
.subscribe(
  // 1. Callback de ÉXITO (lo que ya tenías)
  (data: OrderConfirmationResponse) => {
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
          this.cartDataClient = { ArtData: [{ incart: 0, id_producto: 0 }], total: 0 };
          this.cartTotal$.next(0);
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        });
      }
    });
  },
  // 2. Callback de ERROR (la parte nueva y necesaria)
  (error) => {
    console.error('El backend ha fallado:', error);
    this.spinner.hide(); // Ocultar el spinner en caso de error
    this.toast.error('No se pudo crear la orden. Inténtalo de nuevo.', 'Error del Servidor', {
       timeOut: 3000,
       progressBar: true
    });
  }
);
// ...
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
