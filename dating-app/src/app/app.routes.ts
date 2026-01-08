import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Feed } from './components/feed/feed';
import { Messages } from './components/messages/messages';
import { Profile } from './components/profile/profile';
import { Layout } from './components/layout/layout';
import { Events } from './components/events/events';

export const routes: Routes = [
  { path: 'login', component : Login },

  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'feed', pathMatch: 'full' },
      { path: 'feed', component: Feed },
      { path: 'messages', component: Messages },
      { path: 'profile', component: Profile },
      { path: 'events', component: Events }
    ]
  },

  { path: '**', redirectTo: 'login'}
];
