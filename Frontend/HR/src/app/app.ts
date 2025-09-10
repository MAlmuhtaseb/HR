import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgIf, NgFor, NgClass, NgStyle, CommonModule } from '@angular/common';
import { RandomColor } from './directives/random-color';
import { FormsModule, FormGroup, FormControl, ReactiveFormsModule, FormControlName, Validators } from '@angular/forms';
import { ReversePipe } from './pipes/reverse-pipe';
import { Employees } from './components/employees/employees';
import { Departments } from './components/departments/departments';
@Component({ // Decorator
  selector: 'app-root',
  imports: [RouterOutlet,
   // RandomColor,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ReversePipe,
    Employees,
    Departments,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})// ts, html, css | Component
export class App {

  constructor(private router : Router){

  }

  showNavBar() : boolean{
    return this.router.url !== '/login'
  }

  signOut(){
    // Remove token from local storage
    localStorage.removeItem("token");
    // Re direct to login page
    this.router.navigate(["/login"]);
  }
}
