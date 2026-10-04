import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard, adminGuard } from '../../app/core/guards';
import { AuthService } from '../../app/services/auth.service';
import { NotificationService } from '../../app/services/notification.service';

describe('Route Guards', () => {
  let authServiceMock: {
    isAuthenticated: any;
    isAdmin: any;
  };
  let routerMock: {
    navigate: any;
  };
  let notificationMock: {
    warning: any;
    error: any;
  };

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated: () => false,
      isAdmin: () => false
    };

    routerMock = {
      navigate: vi.fn()
    };

    notificationMock = {
      warning: vi.fn(),
      error: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: NotificationService, useValue: notificationMock }
      ]
    });
  });

  describe('authGuard', () => {
    it('should allow access when user is authenticated', () => {
      authServiceMock.isAuthenticated = () => true;

      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(result).toBe(true);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to /login when user is not authenticated', () => {
      authServiceMock.isAuthenticated = () => false;

      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

      expect(result).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
      expect(notificationMock.warning).toHaveBeenCalled();
    });
  });

  describe('adminGuard', () => {
    it('should allow access when user is admin', () => {
      authServiceMock.isAdmin = () => true;

      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

      expect(result).toBe(true);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to / when user is not admin', () => {
      authServiceMock.isAdmin = () => false;

      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

      expect(result).toBe(false);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
      expect(notificationMock.error).toHaveBeenCalled();
    });
  });
});
