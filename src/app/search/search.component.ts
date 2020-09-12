import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { ConnectService } from '../shared/connect.service';
import { filter, map, tap } from 'rxjs/operators';
import { searchParams } from '../shared/search-param.interface';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {    
  userData:any;
  showDetails:boolean = false;
  type:string;
  isLoading:boolean=false;  
  @ViewChild('searchParam', {static:true}) nameInputRef: ElementRef;


  constructor(
    private authService: AuthService,
    private connect:ConnectService,
    private router:ActivatedRoute) {}

  ngOnInit() {  
    this.nameInputRef.nativeElement.value = '';  
    this.authService.user.subscribe(
      (res) => {
        this.userData = res;        
      }
    )

    this.router.params
    .subscribe(
      res => {                   
        if (typeof res.id != 'undefined') {
          this.nameInputRef.nativeElement.value = res.id;
          this.onSearchEpic(res.id); 
        }        
      }
    )
  }

  onSearchEpic(search:string) {        
    this.isLoading = true;
    this.connect.getJiraData(
      this.authService.url,
      'https://technine.atlassian.net/rest/api/2/issue/' + search,
      "GET",
      {
        username: this.userData.email,
        api_token: this.userData.token,
        basic_auth: btoa(this.userData.email+':'+this.userData.token)
      },
      {}
    )
    .pipe(
      map(
        res => {                    
          return (<searchParams>res).fields.issuetype.name
        }
      )
    )
    .subscribe(
      (resp)=>{  
        this.type = resp;
        this.showDetails = true;        
        this.isLoading = false;
      }
    );      
  }
  // onTaskCheck(event:boolean, key) {  
  //   if (event) {
  //     var index = this.keyList.indexOf(key);
  //     if (index == -1) {
  //       this.keyList.push(key);
  //     }      
  //   } else {
  //     var index = this.keyList.indexOf(key);
  //     this.keyList.splice(index,1);
  //     this.mainChecked = false;
  //   }    
  // }

  // onAllCheck(checked:boolean) {   
  //   this.allChecked = checked;
  //   if (checked) {
  //     this.keyList = this.keyArr;
  //   } else {
  //     this.keyList = [];
  //   }    
  // }
}
