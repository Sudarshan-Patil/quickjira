import { Component, OnInit, EventEmitter } from '@angular/core';
import { DataTablesModule } from 'angular-datatables';
import { HttpClient } from '@angular/common/http';
import { tap, map, filter } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { ConnectService, BoardResponseData } from '../shared/connect.service';



@Component({
  selector: 'app-velocity-report',
  templateUrl: './velocity-report.component.html',
  styleUrls: ['./velocity-report.component.css']
})
export class VelocityReportComponent implements OnInit {
  public eventmode:boolean;
  public checkAll:boolean=false;
  data: any;
  projectList:any;
  boardList:any;
  sprintList:any;
  projects:any;
  sprints:any=[];
  boards:any;
  userData:any;
  boardId:any;
  story:any;
  graphData=[];
  barChartLabels: any=['Total'];
  barChartData: any=[];
  statuses=[];
  showgraph:boolean = false;

  constructor(
    private http:HttpClient,
    private authService: AuthService,
    private connect:ConnectService) {}

  ngOnInit() {
    this.authService.user.subscribe(
      (res) => {
        this.userData = res;
      }
    )

    this.projectList =  this.connect.getJiraData(
        this.authService.url,
        'https://technine.atlassian.net/rest/api/2/project',
        "GET",
        {
          username: this.userData.email,
          api_token: this.userData.token,
          basic_auth: btoa(this.userData.email+':'+this.userData.token)
        },
        {}
      )
      .subscribe(
        (resp)=>{
          this.projects = resp;
        }
      );
  }

  onCheckAll(checked:boolean){
    if (checked) {
      this.checkAll = true;
    } else {
      this.checkAll = false;
    }
  }

  onChangeProject(event:Event) {
    this.boardList =  this.connect.getJiraData(
        this.authService.url,
        'https://technine.atlassian.net/rest/agile/1.0/board/',
        "GET",
        {
          username: this.userData.email,
          api_token: this.userData.token,
          basic_auth: btoa(this.userData.email+':'+this.userData.token)
        },
        {}
      ).pipe(
        map(result => {
            return (<BoardResponseData>result).values.filter(res => {
              return res.location.projectId == (<HTMLInputElement>event.target).value;
            })
          }
        ),
      )
      .subscribe(
        (resp)=>{
          this.boards = resp;
        }
      );
  }

  onChangeBoard(event:Event) {
    this.boardId = (<HTMLInputElement>event.target).value;
    this.connect.getPosts(
        this.authService.url,
        'https://technine.atlassian.net/rest/agile/1.0/board/'+this.boardId+'/sprint',
        "GET",
        {
          username: this.userData.email,
          api_token: this.userData.token,
          basic_auth: btoa(this.userData.email+':'+this.userData.token)
        },
        {}
      ).subscribe(
        (data) => {
          data.filter(
            (res) => {
              this.sprints = this.sprints.concat((<{maxResults:number, startAt:number, isLast:boolean, values:[]}>res).values);
            }
          )
        }
      );
  }

  onChangeSprint(event:Event) {
    this.sprintList =  this.connect.getJiraData(
        this.authService.url,
        'https://technine.atlassian.net/rest/agile/1.0/board/'+this.boardId+'/sprint/'+(<HTMLInputElement>event.target).value+'/issue?jql=(issueType%20in%20("Story","Spike"))&fields=assignee,customfield_10020,customfield_10018,resolutiondate,status&maxResults=1000',
        "GET",
        {
          username: this.userData.email,
          api_token: this.userData.token,
          basic_auth: btoa(this.userData.email+':'+this.userData.token)
        },
        {}
      )
      .subscribe(
        (resp)=>{
        	this.graphData = [];
        	this.barChartData = [];
        	this.barChartLabels = ['Total'];
        	let notAssignedName = 'Not Assigned';
        	let userTotals = {};
        	let usersSorted = [];
        	let graphDataSorted = [];
          (<BoardResponseData>resp).issues.filter((res) => {
              let getSprintData = () => {
                let result = {};
                result[res.key] = [];
                if (res.fields.customfield_10018 == null || res.fields.customfield_10018 == undefined){
                  return result;
                }
                res.fields.customfield_10018.forEach(sprint => {
                  let resultItem       = [];
                  // let sprintDetailsStr = sprint.substr(sprint.indexOf('[')+1, sprint.lastIndexOf[']']);
                  // sprintDetailsStr = sprintDetailsStr.substr(0, sprintDetailsStr.length-1);
                  // let sprintDetails    = sprintDetailsStr.split(',');
                  let sprintDetails = sprint.name;
                  for(let i= 0; i<sprintDetails.length; i++) {
                    let record = sprintDetails[i].split("=");
                    resultItem[record[0]] = record[1];
                  }
                  result[res.key].push(resultItem);
                });
                return result;
            };

            this.statuses = ['Done','In Progress','To Do'];

            if (res.fields.assignee == null || res.fields.assignee == undefined){
              res.fields.assignee = {};
              res.fields.assignee.displayName = notAssignedName;
            }

            let sprintsData = getSprintData();
              if (res.fields.status.statusCategory.name == 'Done' && sprintsData[res.key].length > 1) {
                for (let i = 0; i<sprintsData[res.key].length; i++) {
                  if ((<HTMLInputElement>event.target).value == sprintsData[res.key][i]['id']) {
                      if (sprintsData[res.key][i]['completeDate'] != null && sprintsData[res.key][i]['completeDate'] != undefined) {
                        if (new Date(sprintsData[res.key][i]['completeDate']) < new Date(res.fields.resolutiondate)) {
                            res.fields.status.statusCategory.name = 'In Progress';
                        }
                      }
                      break;
                  }
                }
            }

            if (res.fields.customfield_10020 == null || res.fields.customfield_10020 == undefined){
              res.fields.customfield_10020 = 0;
            }

            if (res.fields.status.statusCategory != null) {
              if(this.graphData[res.fields.assignee.displayName] == undefined) {
                this.graphData[res.fields.assignee.displayName] = {};
                userTotals[res.fields.assignee.displayName] = 0;

                this.statuses.filter(resdata => {
                  this.graphData[res.fields.assignee.displayName][resdata] = 0;
                });
              }

              if(this.graphData[res.fields.assignee.displayName][res.fields.status.statusCategory.name] == undefined) {
                this.graphData[res.fields.assignee.displayName][res.fields.status.statusCategory.name] = 0;
              }

              this.graphData[res.fields.assignee.displayName][res.fields.status.statusCategory.name] = res.fields.customfield_10020 + this.graphData[res.fields.assignee.displayName][res.fields.status.statusCategory.name];
              userTotals[res.fields.assignee.displayName] = userTotals[res.fields.assignee.displayName] + res.fields.customfield_10020;
            }
          });

          //sorting the array based on assigned points..
          usersSorted = Object.keys(userTotals).sort(function(a,b){return userTotals[b]-userTotals[a]});
		  usersSorted.filter(userName => {
	          graphDataSorted[userName] = this.graphData[userName];
          });

		  this.graphData = [];
		  this.graphData = graphDataSorted;

		  //keep unassigned at last...
		  if(this.graphData[notAssignedName]!=null && this.graphData[notAssignedName]!=undefined){
          	let tempNotAssignedData = this.graphData[notAssignedName];
          	delete this.graphData[notAssignedName];
          	this.graphData[notAssignedName] = tempNotAssignedData;

          }

          for (var key in this.graphData) {
            this.barChartLabels.push(key);
          }




          for(let key = 0; key < this.statuses.length; key++){
            let temp=[];
            let totalPoint=0;
            for (var k in this.graphData) {
              totalPoint = totalPoint + this.graphData[k][this.statuses[key]];
              temp.push(this.graphData[k][this.statuses[key]]);
            }
            temp.splice(0, 0, totalPoint);
            this.barChartData.push({data:temp, label:this.statuses[key]});
            this.showgraph = true;
          }
        }
      );

  }
}
