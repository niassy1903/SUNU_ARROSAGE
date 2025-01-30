import { Routes } from '@angular/router';
import { LoginbycodeComponent } from './loginbycode/loginbycode.component';


export const routes: Routes = [

    { path: '', redirectTo: 'loginbycode', pathMatch: 'full' },

    {path: 'loginbycode', component: LoginbycodeComponent }
];
