import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';

import { User } from './user.model';

export interface AuthResponseData {
  self:string,
  name:string
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;
  url = 'https://4awh0poax7.execute-api.ap-south-1.amazonaws.com/jiradev/';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {    
    return this.http
      .post<AuthResponseData>(this.url, {
        url: 'https://technine.atlassian.net/rest/auth/1/session',
        method: "GET",
        param_headers: {
          username: email,
          api_token: password,
          basic_auth: btoa(email+':'+password)
        },
        params:{
        }
      })
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(
            resData.self,
            resData.name,
            email,
            password      
          );
        })
      );
  }

  autoLogin() {
    const userData: {
      self: string;
      name: string;
      email: string,
      token: string;      
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.self,
      userData.email,
      userData.name,
      userData.token,      
    );

    if (loadedUser.name) {
      this.user.next(loadedUser);      
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');        
  }  

  private handleAuthentication(
    self: string,
    name: string,
    email:string,
    token:any 
  ) {    
    const user = new User(self, email, name, token);
    this.user.next(user);    
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
    }
    return throwError(errorMessage);
  }
}
