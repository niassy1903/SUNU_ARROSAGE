import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashbordComponent } from './dashbord/dashbord.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,DashbordComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
