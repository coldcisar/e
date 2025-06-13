
import { Routes } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {CartComponent} from "./components/cart/cart.component";
import {CheckoutComponent} from "./components/checkout/checkout.component";
import {ThankyouComponent} from "./components/thankyou/thankyou.component";
import { ArticuloComponent } from './components/articulo/articulo.component';
import { ProfileGuard } from '../guard/profile.guard';


 export const routes: Routes = [
  {
    path: '', loadComponent:()=>import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'articulos/:id_producto', loadComponent:()=>import('./components/articulo/articulo.component').then(m => m.ArticuloComponent)
  },
  {
    path: 'cart',loadComponent:()=>import('./components/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout', loadComponent:()=>import('./components/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'thankyou', loadComponent:()=>import('./components/thankyou/thankyou.component').then(m => m.ThankyouComponent)
  },
  {
    path: 'login',loadComponent:()=>import('./components/login/login.component').then(m=>m.LoginComponent)
  },
  {
    path:'profile',loadComponent:()=>import('./components/profile/profile.component').then(m=>m.ProfileComponent),canActivate:[ProfileGuard]
  }
];


