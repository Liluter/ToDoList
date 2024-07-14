import { Routes } from '@angular/router';
import { WelcomePageComponent } from './pages/welcome/welcome-page.component';
import { ProjectsPageComponent } from './pages/projects/projects-page.component';
import { LabelsPageCompoent } from './pages/labels/labels-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
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
