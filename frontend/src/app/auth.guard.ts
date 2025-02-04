import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const token = localStorage.getItem('token');
    
    if (token) {
      // L'utilisateur est connecté, il peut accéder à la route
      return true;
    } else {
      // L'utilisateur n'est pas connecté, redirection vers la page de login
      this.router.navigate(['/loginbycode']);
      return false;
    }
  }
}
