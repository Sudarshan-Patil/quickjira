import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ConnectService } from '../shared/connect.service';
import { epicStoriesParam, epicDataParam  } from '../shared/search-param.interface';

@Component({
  selector: 'app-epic',
  templateUrl: './epic.component.html',
  styleUrls: ['./epic.component.css']
})
export class EpicComponent implements OnInit {  
  userData:any;  
  keyList:any=[];
  keyArr:any=[];
  allChecked:boolean;
  mainChecked:boolean=false;
  isEditable:boolean=false;  
  @Input() epic;
  epicStories:any;
  epicData:any=[];
  showDetails:boolean=false;
  isLoading:boolean=false;
  statuses=[];
  @Input() searchtype:string;
  
  constructor(
    private authService: AuthService,
    private connect:ConnectService) { }

  ngOnInit() {      
  }
  ngOnChanges() {     
    this.isLoading=true;   
    this.authService.user.subscribe(
      (res) => {
        this.userData = res;        
      }
    );

    this.connect.getJiraData(
      this.authService.url,
      'https://technine.atlassian.net/rest/api/2/issue/OEHA-8244/transitions',      
      "GET",
      {
        username: this.userData.email,
        api_token: this.userData.token,
        basic_auth: btoa(this.userData.email+':'+this.userData.token)
      },
      {}
    ).subscribe(
      res=> {        
        (<{expand:string,transitions:[{name:string}]}>res).transitions.filter(
          resp => {            
            this.statuses.push(resp.name);
          }
        );        
      }
    )
    
    this.onLoadEpic();
  }

  onLoadEpic() {
    this.showDetails = false;
    this.connect.getJiraData(
      this.authService.url,
      'https://technine.atlassian.net/rest/api/2/issue/'+this.epic+'?fields=project,customfield_10020,assignee,status,summary,description',      
      "GET",
      {
        username: this.userData.email,
        api_token: this.userData.token,
        basic_auth: btoa(this.userData.email+':'+this.userData.token)
      },
      {}
    )    
    .subscribe(
      (data) => {               
        this.epicData['project'] = (<epicDataParam>data).fields.project.name;   
        this.epicData['summary'] = (<epicDataParam>data).fields.summary;   
        this.epicData['description'] = (<epicDataParam>data).fields.description;   
        this.epicData['storyPoint'] = (<epicDataParam>data).fields.customfield_10020;
        if ((<epicDataParam>data).fields.assignee != null) {
          this.epicData['assignee'] = (<epicDataParam>data).fields.assignee.displayName;
        } else {
          this.epicData['assignee'] = 'No assignee';
        }
        this.epicData['status'] = (<epicDataParam>data).fields.status.name;                
        
        this.connect.getJiraData(
          this.authService.url,
          'https://technine.atlassian.net/rest/api/2/search?jql=(cf[10013]="'+this.epic+'")&fields=issuetype,customfield_10020,priority,assignee,status,summary,description',
          "GET",
          {
            username: this.userData.email,
            api_token: this.userData.token,
            basic_auth: btoa(this.userData.email+':'+this.userData.token)
          },
          {}
        ).subscribe(
          res => {
            this.epicStories = (<epicStoriesParam>res).issues;
            this.showDetails = true;            
            this.isLoading=false;
          }
        );            
      }
    ); 
  }

  onTaskCheck(event:boolean, key) {    
    if (event) {
      var index = this.keyList.indexOf(key);
      if (index == -1) {
        this.keyList.push(key);
      }      
    } else {
      var index = this.keyList.indexOf(key);
      this.keyList.splice(index,1);
      this.mainChecked = false;
    } 
    console.log(this.keyList);   
  }

  onAllCheck(checked:boolean) {    
    this.allChecked = checked;
    if (checked) {
      this.keyList = this.keyArr;
    } else {
      this.keyList = [];
    }   
    console.log(this.keyList);
  }

  onEdit() {
    this.isEditable = true;
  }

  onReset() {
    this.isEditable = false;
  }
  
}
