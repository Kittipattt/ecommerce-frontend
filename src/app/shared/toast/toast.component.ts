import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="'toast-' + toast.type" (click)="notificationService.remove(toast.id)">
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            } @else if (toast.type === 'error') {
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            } @else if (toast.type === 'warning') {
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            } @else {
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            }
          </div>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" (click)="notificationService.remove(toast.id); $event.stopPropagation()">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }
    .toast-item {
      pointer-events: auto;
      min-width: 300px;
      max-width: 420px;
      padding: 14px 18px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--bg-surface-elevated);
      color: var(--text-main);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
      border: 1px solid var(--border);
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }
    .toast-success {
      border-left: 4px solid var(--success);
      background: linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, var(--bg-surface-elevated) 30%);
    }
    .toast-error {
      border-left: 4px solid var(--danger);
      background: linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, var(--bg-surface-elevated) 30%);
    }
    .toast-warning {
      border-left: 4px solid var(--warning);
      background: linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, var(--bg-surface-elevated) 30%);
    }
    .toast-info {
      border-left: 4px solid var(--accent);
      background: linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, var(--bg-surface-elevated) 30%);
    }
    .toast-msg {
      font-size: 0.9rem;
      font-weight: 500;
      flex: 1;
    }
    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1rem;
    }
    .toast-close:hover {
      color: var(--text-main);
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
