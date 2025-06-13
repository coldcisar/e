import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { UserService } from "../app/services/user.service";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ProfileGuard implements CanActivate {

    constructor(
        private userService: UserService,
        private router: Router
    ) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        
        if (this.userService.authState$.getValue()) {
            // Si el valor es 'true', el usuario está autenticado y puede pasar.
            return true;
        }

        // Si es 'false', lo redirigimos al login.
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}