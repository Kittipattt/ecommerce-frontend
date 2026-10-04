import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto w-full p-4 rounded-xl flex items-center gap-3 bg-gray-800/95 backdrop-blur-md text-gray-100 shadow-2xl border transition-all cursor-pointer animate-in fade-in slide-in-from-right duration-200"
          [ngClass]="{
            'border-gray-700/80 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-950/40 via-gray-800/95 to-gray-800/95': toast.type === 'success',
            'border-gray-700/80 border-l-4 border-l-red-500 bg-gradient-to-r from-red-950/40 via-gray-800/95 to-gray-800/95': toast.type === 'error',
            'border-gray-700/80 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-950/40 via-gray-800/95 to-gray-800/95': toast.type === 'warning',
            'border-gray-700/80 border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-950/40 via-gray-800/95 to-gray-800/95': toast.type === 'info'
          }"
          (click)="notificationService.remove(toast.id)">
          <div class="shrink-0">
            @if (toast.type === 'success') {
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            } @else if (toast.type === 'error') {
              <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            } @else if (toast.type === 'warning') {
              <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            } @else {
              <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            }
          </div>
          <span class="text-sm font-medium flex-1 text-gray-200">{{ toast.message }}</span>
          <button class="text-gray-400 hover:text-white transition-colors text-sm p-1 shrink-0" (click)="notificationService.remove(toast.id); $event.stopPropagation()">✕</button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
