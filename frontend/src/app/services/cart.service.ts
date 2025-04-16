
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
    ArtData: [{
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

    let info: CartModelPublic = JSON.parse(localStorage.getItem('cart') || '{}');

    if (info !== null && info !== undefined && info.ArtData[0].incart !== 0) {
      // assign the value to our data variable which corresponds to the LocalStorage data format
      this.cartDataClient = info;
      // Loop through each entry and put it in the cartDataServer object
      this.cartDataClient.ArtData.forEach(a => {
        this.ArticuloService.getSingleProduct(a.id_producto).subscribe((actualArtInfo: ArticuloModelServer) => {
          if (this.cartDataServer.ArtData[0].numInCart === 0) {
            this.cartDataServer.ArtData[0].numInCart = a.incart;
            this.cartDataServer.ArtData[0].articulo = actualArtInfo;
            this.CalculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          } else {
            this.cartDataServer.ArtData.push({
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

    let a = this.cartDataServer.ArtData[index];
    // @ts-ignore
    subTotal = a.articulo.precio * a.numInCart;

    

    return subTotal;
  }
AddProductToCart(id_producto: number, cantidad?: number) {
  // Asegurarnos de que ArtData esté siempre inicializado como un arreglo
  if (!this.cartDataServer.ArtData) {
    this.cartDataServer.ArtData = [];
  }

  this.ArticuloService.getSingleProduct(id_producto).subscribe(arti => {
    if (!arti) {
      console.error("Producto no encontrado");
      return; // Salimos si no encontramos el producto
    }

    // Verificar si el carrito está vacío
    if (this.cartDataServer.ArtData.length === 0 || this.cartDataServer.ArtData[0].articulo === undefined) {
      this.cartDataServer.ArtData[0] = {
        articulo: arti,
        numInCart: cantidad !== undefined ? cantidad : 1
      };
      this.CalculateTotal();
      this.cartDataClient.ArtData[0] = {
        incart: this.cartDataServer.ArtData[0].numInCart,
        id_producto: arti.id_producto
      };
      this.cartDataClient.total = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      this.cartDataObs$.next({ ...this.cartDataServer });
      this.toast.success(`${arti.nombre_producto} added to the cart.`, "Product Added", {
        timeOut: 1500,
        progressBar: true,
        progressAnimation: 'increasing',
        positionClass: 'toast-top-right'
      });
    } else {
      // El carrito no está vacío, verificar si el producto ya está en el carrito
      let index = this.cartDataServer.ArtData.findIndex(a => a.articulo?.id_producto === arti.id_producto);

      // Si el producto ya está en el carrito
      if (index !== -1) {
        if (cantidad !== undefined && cantidad <= arti.cantidad) {
          this.cartDataServer.ArtData[index].numInCart = Math.min(this.cartDataServer.ArtData[index].numInCart + cantidad, arti.cantidad);
        } else {
          this.cartDataServer.ArtData[index].numInCart = Math.min(this.cartDataServer.ArtData[index].numInCart + 1, arti.cantidad);
        }

        this.cartDataClient.ArtData[index].incart = this.cartDataServer.ArtData[index].numInCart;
        this.toast.info(`${arti.nombre_producto} quantity updated in the cart.`, "Product Updated", {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        });
      }
      // Si el producto no está en el carrito, agregarlo
      else {
        this.cartDataServer.ArtData.push({
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
        });
      }

      // Actualizamos el total del carrito
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      this.cartDataObs$.next({ ...this.cartDataServer });
    }
  });
}

  
  UpdateCartData(index: number, increase: boolean) {
    let data = this.cartDataServer.ArtData[index];
  
    // Verificar si el producto existe
    if (data && data.articulo) {
      if (increase) {
        // Si se va a incrementar
        if (data.numInCart < data.articulo.cantidad) {
          data.numInCart++;
        }
        // Actualizamos el carrito del cliente
        this.cartDataClient.ArtData[index].incart = data.numInCart;
  
        this.CalculateTotal();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
  
        // Notificar cambios en el carrito
        this.cartDataObs$.next({ ...this.cartDataServer });
      } else {
        // Si se va a decrementar
        if (data.numInCart > 1) {
          data.numInCart--;
          this.cartDataClient.ArtData[index].incart = data.numInCart;
          
          this.CalculateTotal();
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
  
          this.cartDataObs$.next({ ...this.cartDataServer });
        } else {
          // Si la cantidad es 1 o menor, eliminamos el producto
          this.DeleteProductFromCart(index);
          this.cartDataObs$.next({ ...this.cartDataServer });
        }
      }
    }
  }
  
  DeleteProductFromCart(index:number) {
    /*    console.log(this.cartDataClient.prodData[index].prodId);
        console.log(this.cartDataServer.data[index].product.id);*/

    if (window.confirm('Are you sure you want to delete the item?')) {
      this.cartDataServer.ArtData.splice(index, 1);
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
          ArtData: [{
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
    this.cartDataServer.ArtData.forEach(a => {
      Total += a.numInCart * (a.articulo?.precio ?? 0);
    });
    this.cartDataServer.total = Total;
    this.cartTotal$.next(this.cartDataServer.total);
  }
  

  private resetServerData() {
    this.cartDataServer = {
      ArtData: [{
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
