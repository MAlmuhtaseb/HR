import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
   apiUrl : string = "https://localhost:44324/api/Auth";
  constructor(private _http : HttpClient){

  }

  login(loginForm : any){

    return this._http.post(this.apiUrl + "/Login", loginForm)
  }
}
