import { Routes } from '@angular/router';
import { WelcomePageComponent } from './pages/welcome/welcome-page.component';
import { ProjectsPageComponent } from './pages/projects/projects-page.component';
import { LabelsPageCompoent } from './pages/labels/labels-page.component';
import { AddTaskPageComponent } from './pages/add/task/add-task-page.component';
import { AddProjectPageComponent } from './pages/add/project/add-project-page.component';
import { AddLabelPageComponent } from './pages/add/label/add-label-page.component';
import { UncompletedPageComponent } from './pages/tasks/uncompleted/uncompleted-page.component';
import { CompletedPageComponent } from './pages/tasks/completed/completed-page.component';
import { AllPageComponent } from './pages/tasks/all/all-page.component';
import { DetailComponent } from './pages/detail/detail.component';
import { EditComponent } from './pages/edit/edit.component';
import { LabelDetailsComponent } from './pages/labels/detail/label-details.component';
import { LabelEditComponent } from './pages/labels/edit/label-edit.component';
import { ProjectDetailComponent } from './pages/projects/detail/project-detail.component';
import { ProjectEditCompoennt } from './pages/projects/edit/project-edit.component';

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
    path: 'tasks/uncompleted',
    component: UncompletedPageComponent
  },
  {
    path: 'tasks/completed',
    component: CompletedPageComponent
  },
  {
    path: 'tasks/all',
    component: AllPageComponent
  },
  {
    path: 'projects',
    component: ProjectsPageComponent
  },
  {
    path: 'project/details/:id',
    component: ProjectDetailComponent
  },
  {
    path: 'project/edit/:id',
    component: ProjectEditCompoennt
  },
  {
    path: 'labels',
    component: LabelsPageCompoent
  },
  {
    path: 'label/details/:id',
    component: LabelDetailsComponent
  },
  {
    path: 'label/edit/:id',
    component: LabelEditComponent
  },
  {
    path: 'welcome',
    component: WelcomePageComponent
  },
  {
    path: 'detail/:id',
    component: DetailComponent
  },
  {
    path: 'edit/:id',
    component: EditComponent
  }
];
