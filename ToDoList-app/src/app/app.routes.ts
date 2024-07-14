import { Routes } from '@angular/router';
import { WelcomePageComponent } from './pages/welcome/welcome-page.component';
import { ProjectsPageComponent } from './pages/projects/projects-page.component';
import { LabelsPageCompoent } from './pages/labels/labels-page.component';
import { TasksPageComponent } from './pages/tasks/tasks-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'tasks',
    component: TasksPageComponent
  },
  {
    path: 'projects',
    component: ProjectsPageComponent
  },
  {
    path: 'labels',
    component: LabelsPageCompoent
  },
  {
    path: 'welcome',
    component: WelcomePageComponent
  }
];
