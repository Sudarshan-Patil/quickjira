import { Component, OnInit, Input } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  @Input() barChartLabels;
  @Input() barChartData; 
  
  barChartColors = [    
    { // Done
      backgroundColor: 'rgba(0,128,0,1)',
      borderColor: 'rgba(0,128,0,1)',
      pointBackgroundColor: 'rgba(0,128,0,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // In progress
      backgroundColor: 'rgb(0, 82, 204)',
      borderColor: 'rgb(0, 82, 204)',
      pointBackgroundColor: 'rgb(0, 82, 204)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(0, 82, 204)'
    },
    { // To DO
      backgroundColor: 'rgb(223, 225, 230)',
      borderColor: 'rgb(223, 225, 230)',
      pointBackgroundColor: 'rgb(223, 225, 230)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(223, 225, 230)'
    }
  ];
  
  public barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
  };
  public barChartType: ChartType = 'horizontalBar';
  public barChartLegend = true;

  constructor() { }

  ngOnInit() {
  }  
}
