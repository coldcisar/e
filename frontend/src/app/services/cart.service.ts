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

  private cartDataClient: CartModelPublic = {prodData: [{incart: 0, id: 0}], total: 0};  // This will be sent to the backend Server as post data
  // Cart Data variable to store the cart information on the server
  private cartDataServer: CartModelServer = {
    data: [],
    total: 0
  };

  cartTotal$ = new BehaviorSubject<number>(0);
  // Data variable to store the cart information on the client's local storage

  cartDataObs$ = new BehaviorSubject<CartModelServer>(this.cartDataServer);


  constructor(private productService: ArticuloService,
              private orderService: OrderService,
              private httpClient: HttpClient,
              private router: Router,
              private spinner: NgxSpinnerService,
              private toast: ToastrService) {

  this.cartTotal$.next(this.cartDataServer.total);
  this.cartDataObs$.next(this.cartDataServer);
                
  const cart = localStorage.getItem('cart');
  let info: CartModelPublic | null = null;
                
  try {
    if (cart) {
       info = JSON.parse(cart);
    }
    } catch (e) {
    console.error("Error parsing cart data", e);
   }
                
   if (info && info.prodData && info.prodData.length > 0 && info.prodData[0].incart !== 0) {
    this.cartDataClient = info;
                
        this.cartDataClient.prodData.forEach(p => {
        this.productService.getSingleProduct(p.id).subscribe((actualProdInfo: ArticuloModelServer) => {
        const existingIndex = this.cartDataServer.data.findIndex(item => item.product.id_producto === p.id);
                
        if (existingIndex === -1) {
        this.cartDataServer.data.push({
          product: actualProdInfo,
          numInCart: p.incart
          });
          } else {
           this.cartDataServer.data[existingIndex].numInCart += p.incart;
         }
                
        this.CalculateTotal();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartDataObs$.next({ ...this.cartDataServer });
      });
   });
  }
}
                
  CalculateSubTotal(index:number): number {
    let subTotal = 0;

    let p = this.cartDataServer.data[index];
    // @ts-ignore
    subTotal = p.product.price * p.numInCart;

    return subTotal;
  }

  AddProductToCart(id: number, cantidad?: number) {

    this.productService.getSingleProduct(id).subscribe(prod => {
      // If the cart is empty
      if (this.cartDataServer.data[0].product === undefined) {
        this.cartDataServer.data[0].product = prod;
        this.cartDataServer.data[0].numInCart = cantidad !== undefined ? cantidad : 1;
        this.CalculateTotal();
        this.cartDataClient.prodData[0].incart = this.cartDataServer.data[0].numInCart;
        this.cartDataClient.prodData[0].id = prod.id_producto;
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartDataObs$.next({...this.cartDataServer});
        this.toast.success(`${prod.nombre_producto} added to the cart.`, "Product Added", {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        })
      }  // END of IF
      // Cart is not empty
      else {
        let index = this.cartDataServer.data.findIndex(p => p.product.id_producto=== prod.id_producto);

        // 1. If chosen product is already in cart array
        if (index !== -1) {

          if (cantidad !== undefined && cantidad <= prod.cantidad) {
            // @ts-ignore
            this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.cantidad ? cantidad : prod.cantidad;
          } else {
            // @ts-ignore
            this.cartDataServer.data[index].numInCart < prod.cantidad ? this.cartDataServer.data[index].numInCart++ : prod.cantidad;
          }


          this.cartDataClient.prodData[index].incart = this.cartDataServer.data[index].numInCart;
          this.toast.info(`${prod.nombre_producto} quantity updated in the cart.`, "Product Updated", {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          })
        }
        // 2. If chosen product is not in cart array
        else {
          this.cartDataServer.data.push({
            product: prod,
            numInCart: 1
          });
          this.cartDataClient.prodData.push({
            incart: 1,
            id: prod.id_producto
          });
          this.toast.success(`${prod.nombre_producto} added to the cart.`, "Product Added", {
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
      data.numInCart < data.product.quantity ? data.numInCart++ : data.product.quantity;
      this.cartDataClient.prodData[index].incart = data.numInCart;
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
        this.cartDataClient.prodData[index].incart = data.numInCart;
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
      this.cartDataClient.prodData.splice(index, 1);
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;

      if (this.cartDataClient.total === 0) {
        this.cartDataClient = {prodData: [{incart: 0, id: 0}], total: 0};
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      } else {
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }

      if (this.cartDataServer.total === 0) {
        this.cartDataServer = {
          data: [],
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

  CheckoutFromCart(userId: number) {
    // Primer POST para procesar el pago
    this.httpClient.post<{ success: boolean }>(`${this.ServerURL}ordenes/payment`, null)
      .subscribe((res) => {
        console.clear();
  
        if (res.success) {
          this.resetServerData();
  
          // Segundo POST para crear una nueva orden
          this.httpClient.post<OrderConfirmationResponse>(`${this.ServerURL}ordenes/nuevo`, {
            userId: userId,
            products: this.cartDataClient.prodData
          }).subscribe((data: OrderConfirmationResponse) => {
            // Obtener detalles de la orden
            this.orderService.getSingleOrder(data.order_id).then(prods => {
              if (data.success) {
                const navigationExtras: NavigationExtras = {
                  state: {
                    message: data.message,
                    products: prods,
                    orderId: data.order_id,
                    total: this.cartDataClient.total
                  }
                };
                this.spinner.hide().then();
                this.router.navigate(['/thankyou'], navigationExtras).then(() => {
                  // Limpiar datos del carrito
                  this.cartDataClient = { prodData: [{ incart: 0, id: 0 }], total: 0 };
                  this.cartTotal$.next(0);
                  localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
                });
              }
            });
  
          }, (error) => {
            // Manejo de errores en caso de que falle la creación de la orden
            this.spinner.hide().then();
            this.router.navigateByUrl('/checkout').then();
            this.toast.error(`Sorry, failed to book the order`, "Order Status", {
              timeOut: 1500,
              progressBar: true,
              progressAnimation: 'increasing',
              positionClass: 'toast-top-right'
            });
          });
  
        } else {
          this.spinner.hide().then();
          this.router.navigateByUrl('/checkout').then();
          this.toast.error(`Sorry, failed to book the order`, "Order Status", {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          });
        }
      }, (error) => {
        // Manejo de errores si falla la solicitud de pago
        this.spinner.hide().then();
        this.router.navigateByUrl('/checkout').then();
        this.toast.error(`Payment failed`, "Payment Error", {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        });
      });
  }
  


  private CalculateTotal() {
    let Total = 0;

    this.cartDataServer.data.forEach(p => {
      const {numInCart} = p;
      const {precio} = p.product;
      // @ts-ignore
      Total += numInCart * precio;
    });
    this.cartDataServer.total = Total;
    this.cartTotal$.next(this.cartDataServer.total);
  }

  private resetServerData() {
    this.cartDataServer = {
      data: [],
      total: 0
    };
    this.cartDataObs$.next({...this.cartDataServer});
  }

}

interface OrderConfirmationResponse {
  order_id: number;
  success: Boolean;
  message: string;
  products: [{
    id: string,
    numInCart: string
  }]
}