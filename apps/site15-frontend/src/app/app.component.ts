import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@site15/common';
import { environment } from '../environments/environment';

@Component({
  selector: 'site15-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  hello$ = this.http.get<Message>(`${environment.api}/hello`);
  db$ = this.http.get<Message>(`${environment.api}/db`);
  constructor(private http: HttpClient) { }
}
