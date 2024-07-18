import { Routes } from '@angular/router';
import { WelcomePageComponent } from './pages/welcome/welcome-page.component';
import { ProjectsPageComponent } from './pages/projects/projects-page.component';
import { LabelsPageCompoent } from './pages/labels/labels-page.component';
import { TasksPageComponent } from './pages/tasks/tasks-page.component';
import { AddTaskPageComponent } from './pages/add/task/add-task-page.component';
import { AddProjectPageComponent } from './pages/add/project/add-project-page.component';
import { AddLabelPageComponent } from './pages/add/label/add-label-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'add/task',
    component: AddTaskPageComponent
  },
  {
    path: 'add/project',
    component: AddProjectPageComponent
  },
  {
    path: 'add/label',
    component: AddLabelPageComponent
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
