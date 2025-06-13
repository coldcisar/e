import { Injectable } from "@angular/core";
import { GoogleLoginProvider, SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environment/environment";
import { BehaviorSubject } from "rxjs";

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

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private SERVER_URL: string = environment.serverURL;

  // Inicializamos directamente con el estado que queremos.
  authState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // El tipo debe incluir `null` para el estado inicial y el logout.
  userData$: BehaviorSubject<SocialUser | ResponseModel | null> = new BehaviorSubject<SocialUser | ResponseModel | null>(null);

  constructor(
    private authService: SocialAuthService,
    private httpClient: HttpClient 
  ) {
    // Esta suscripción maneja el login a través de Google
    this.authService.authState.subscribe((user: SocialUser) => {
      if (user) {
        this.authState$.next(true);  // Emitimos directamente el nuevo estado
        this.userData$.next(user);
      }
    });
  }

  loginUser(email: string, password: string) {
    return this.httpClient.post<ResponseModel>(`${this.SERVER_URL}/auth/login`, { email, password })
      .subscribe((data: ResponseModel) => {
        this.userData$.next(data);
        // La propiedad 'auth' debería ser un booleano desde el backend.
        this.authState$.next(data.auth);
      });
  }

  googleLogin() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  logout() {
    this.authService.signOut();
    this.authState$.next(false);
    this.userData$.next(null);
  }
}