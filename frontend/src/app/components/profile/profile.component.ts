import { CommonModule } from '@angular/common'; 
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; //
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { map } from 'rxjs/operators'; //
import { UserService } from '../../services/user.service';


interface ResponseModel {
    token: string;
    auth: boolean;
    email?: string;
    username?: string;
    fname?: string;
    lname?: string;
    photoUrl?: string;
    userId?: number;
}

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule
    ],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
    myUser: any;

    constructor(
        private authService: SocialAuthService,
        private userService: UserService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.userService.userData$.pipe(
          map((user) => { 
            if (user instanceof SocialUser) {
              // Si es usuario de Google, creamos un objeto con el formato que nuestro HTML espera
              return {
                ...user,
                fname: user.firstName,
                lname: user.lastName,
                photoUrl: user.photoUrl,
                userId: user.id // Asignamos 'id' de Google a 'userId'
              };
            } else {
              // Si es un usuario normal, lo dejamos pasar
              return user;
            }
          })
        ).subscribe((data) => { // La sintaxis correcta para la función de flecha
            this.myUser = data;
        });
    }

    logout() {
        this.userService.logout();
        // Después de hacer logout, redirigimos al usuario a la página de inicio o login
        this.router.navigate(['/login']);
    }
}