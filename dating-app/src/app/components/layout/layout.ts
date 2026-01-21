import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  public currentUser: any = null;
  showRightSidebar = true;
  private routerSub?: Subscription;

  ngOnInit() {
    this.checkSidebar(this.router.url);
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkSidebar(event.url);
    });
    this.currentUser = this.authService.getCurrentUserValue();
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private checkSidebar(url: string) {
    this.showRightSidebar = !url.includes('/messages');
  }
}
