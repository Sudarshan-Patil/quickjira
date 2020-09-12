import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StoryComponent } from './story/story.component';
import { VelocityReportComponent } from './velocity-report/velocity-report.component';
import { SearchComponent } from './search/search.component';
import { EpicComponent } from './epic/epic.component';

const appRoutes: Routes = [
  {path: '', redirectTo: 'velocity-report', pathMatch:'full'},  
  {path: 'search', component: SearchComponent, canActivate: [AuthGuard]},
  {path: 'velocity-report', component: VelocityReportComponent, canActivate: [AuthGuard]},
  {path: 'search/:id', component: SearchComponent, canActivate: [AuthGuard]},
  {path: 'auth', component: AuthComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
