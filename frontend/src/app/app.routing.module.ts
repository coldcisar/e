
import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "./components/home/home.component";
import {CartComponent} from "./components/cart/cart.component";
import {CheckoutComponent} from "./components/checkout/checkout.component";
import {ThankyouComponent} from "./components/thankyou/thankyou.component";
import { ArticuloComponent } from './components/articulo/articulo.component';


const routes: Routes = [
  {
    path:"", component: HomeComponent
  },
  {
    path:"articulo/:id_articulo",component:ArticuloComponent
  },
  {
    path: "cart", component:CartComponent
  },
  {
    path:"checkout",component:CheckoutComponent
  },
  {
    path:"thankyou",component:ThankyouComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
