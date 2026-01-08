import { Component } from '@angular/core';
import { CommonModule} from '@angular/common';
import { RouterLink} from '@angular/router';

@Component({
  selector: 'app-messages',
  imports: [RouterLink, CommonModule],
  templateUrl: './messages.html',
  styles: ``,
})
export class Messages {

  users = [
    { id: 1, name: 'Anna Nowak', lastMsg: 'Do zobaczenia jutro! 😘', time: '10:30', avatar: 'bg-danger', active: true },
    { id: 2, name: 'Piotr Kowalski', lastMsg: 'Jasne, pasuje mi.', time: '09:15', avatar: 'bg-warning', active: false },
    { id: 3, name: 'Kasia Wójcik', lastMsg: 'Wysłałam Ci zdjęcie.', time: 'Wczoraj', avatar: 'bg-info', active: false },
    { id: 4, name: 'Marek Zając', lastMsg: 'Dzięki za spotkanie!', time: 'Pn', avatar: 'bg-success', active: false }
  ];

  // Zmienna przechowująca aktualnie wybraną rozmowę
  selectedUser: any = null;

  // Funkcja: Wybierz użytkownika (otwiera czat)
  selectUser(user: any) {
    this.selectedUser = user;
  }

  // Funkcja: Wróć do listy (tylko dla mobile)
  backToList() {
    this.selectedUser = null;
  }

}
