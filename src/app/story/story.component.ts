import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ConnectService } from '../shared/connect.service';
import { storyDataParam  } from '../shared/search-param.interface';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.css']
})
export class StoryComponent implements OnInit {  
  userData:any;
  showDetails:boolean = false;
  keyList:any=[];
  keyArr:any=[];
  allChecked:boolean;
  mainChecked:boolean=false;
  isEditable:boolean = false;
  statuses=[];
  @Input() story;
  storyData:any=[];
  isLoading:boolean=false;
  @Input() searchtype:string;
  
  constructor(
    private authService: AuthService,
    private connect:ConnectService) { }

  ngOnInit() { }

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

    this.onLoadStory();
  }

  onLoadStory() {
    this.showDetails = false;
    this.connect.getJiraData(
      this.authService.url,
      'https://technine.atlassian.net/rest/api/2/issue/'+this.story,      
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
        this.storyData['project'] = (<storyDataParam>data).fields.project.name;   
        this.storyData['summary'] = (<storyDataParam>data).fields.summary;   
        this.storyData['description'] = (<storyDataParam>data).fields.description;   
        this.storyData['storyPoint'] = (<storyDataParam>data).fields.customfield_10020;
        if ((<storyDataParam>data).fields.assignee != null) {
          this.storyData['assignee'] = (<storyDataParam>data).fields.assignee.displayName;
        } else {
          this.storyData['assignee'] = 'No assignee';
        }
        this.storyData['status'] = (<storyDataParam>data).fields.status.name;    
        
        this.storyData['subtasks'] = (<storyDataParam>data).fields.subtasks;
        this.showDetails = true;
        this.isLoading=false;                  
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
  }

  onAllCheck(checked:boolean) {    
    this.allChecked = checked;
    if (checked) {
      this.keyList = this.keyArr;
    } else {
      this.keyList = [];
    }    
  }

  onEdit() {
    this.isEditable = true;
  }

  onReset() {
    this.isEditable = false;
  }
  
}
