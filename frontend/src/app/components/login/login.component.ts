import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; 
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  
  email!: string;
  password!: string;
  // --------------------------------------------------------------------------

  constructor(
    private authService: SocialAuthService,
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Esta suscripción te redirigirá si ya estás logueado
    this.userService.authState$.subscribe(authState => {
      if (authState) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/perfil';
        this.router.navigateByUrl(returnUrl);
      }
    });
  }

  signInWithGoogle() {
    this.userService.googleLogin();
  }

  login(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    // Obtenemos los valores de forma segura desde el formulario
    const { email, password } = form.value;

    this.userService.loginUser(email, password);
  }
}