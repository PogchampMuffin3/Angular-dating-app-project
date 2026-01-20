import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Potrzebne do *ngIf
import { Router, RouterLink, RouterOutlet, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Auth } from '../../services/auth';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styles: ``
})
export class Layout implements OnInit, OnDestroy {
  public authService = inject(Auth);
  private router = inject(Router);
  
  // Zmienna sterująca widocznością prawego panelu
  showRightSidebar = true;
  private routerSub?: Subscription;

  ngOnInit() {
    // 1. Sprawdź URL przy załadowaniu (np. po odświeżeniu strony)
    this.checkSidebar(this.router.url);

    // 2. Nasłuchuj zmian URL (nawigacja między stronami)
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkSidebar(event.url);
    });
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private checkSidebar(url: string) {
    // Ukryj sidebar, jeśli jesteśmy w sekcji /messages
    // Możesz tu dodać inne wyjątki w przyszłości
    this.showRightSidebar = !url.includes('/messages');
  }
}
