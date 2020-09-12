import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { expand, map, reduce } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

export interface BoardResponseData{
  maxResults: number,
  startAt: number,
  total?: number,
  isLast?: boolean,
  values?;
  expand?:any;
  issues?:any[];
}

@Injectable({
  providedIn: 'root'
})

export class ConnectService {
  returnData=[];
  sprintData:BoardResponseData;
  sprintArr:any=[];
  constructor(private http:HttpClient) {}

  getJiraData(url:string, api:string, method:string, param_headers:{username:string, api_token:any, basic_auth:any}, params?:{}) {
    return this.http.post(url, {url:api, method:method, param_headers:param_headers, params:params});
  }

  getPosts(url:string, api:string, method:string, param_headers:{username:string, api_token:any, basic_auth:any}, params?:{}) {
    const result1 = this.http.post(url, {url:api, method:method, param_headers:param_headers, params:params});
    let jiraapi = api + '?startAt=50';
    const result2 = this.http.post(url, {url:jiraapi, method:method, param_headers:param_headers, params:params});
    jiraapi = api + '?startAt=100';
    const result3 = this.http.post(url, {url:jiraapi, method:method, param_headers:param_headers, params:params});
    jiraapi = api + '?startAt=150';
    const result4 = this.http.post(url, {url:jiraapi, method:method, param_headers:param_headers, params:params});
    return forkJoin([result1, result2, result3, result4]);
  }
}
