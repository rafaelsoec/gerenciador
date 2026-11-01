import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // No servidor (SSR) não há localStorage — deixa passar e o cliente decide
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (auth.estaAutenticado()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
