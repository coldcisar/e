import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app.routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HeadersComponent } from "./components/headers/headers.component";
import { FooterComponent } from "./components/footer/footer.component";
import { CartComponent } from "./components/cart/cart.component";
import { CheckoutComponent } from "./components/checkout/checkout.component";
import { HomeComponent } from "./components/home/home.component";
import { ArticuloComponent } from "./components/articulo/articulo.component";
import { ThankyouComponent } from "./components/thankyou/thankyou.component";
import { BrowserModule } from "@angular/platform-browser";

@NgModule({
    declarations:[
        AppComponent,
        HeadersComponent,
        FooterComponent,
        CartComponent,
        CheckoutComponent,
        HomeComponent,
        ArticuloComponent,
        ThankyouComponent,
    ],
    imports:[
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule
    ],
    providers:[],
    bootstrap:[AppComponent]
})
export class AppModule {}
