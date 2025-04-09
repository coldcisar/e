
import { Routes } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {CartComponent} from "./components/cart/cart.component";
import {CheckoutComponent} from "./components/checkout/checkout.component";
import {ThankyouComponent} from "./components/thankyou/thankyou.component";
import { ArticuloComponent } from './components/articulo/articulo.component';


 export const routes: Routes = [
  {
    path: '', loadComponent:()=>import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'articulo/id_producto', loadComponent:()=>import('./components/articulo/articulo.component').then(m => m.ArticuloComponent)
  },
  {
    path: 'cart',loadComponent:()=>import('./components/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout', loadComponent:()=>import('./components/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'thankyou', loadComponent:()=>import('./components/thankyou/thankyou.component').then(m => m.ThankyouComponent)
  }
];


