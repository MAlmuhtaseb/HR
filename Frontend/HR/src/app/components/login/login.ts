import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  showErrorMessage : boolean = false;
  errorMessage : string = "";

  constructor(private _authService : AuthService,
    private _router: Router
  ){

  }

  loginFrom = new FormGroup({
    Username: new FormControl(null, [Validators.required]),
    Password: new FormControl(null, [Validators.required])
  });


  login(){

    let loginObj = {
      UserName : this.loginFrom.value.Username,
      Password : this.loginFrom.value.Password
    }

    this._authService.login(loginObj).subscribe({
      next: (res : any) => {
        //console.log(res); // token
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.role);
        this.showErrorMessage = false;
        this._router.navigate(["/"]);
      },
      error: err => {
        this.showErrorMessage = true;
       this.errorMessage = err.error.message ?? err.error ?? "Unexpected Error";
      }
    })
  }
}
