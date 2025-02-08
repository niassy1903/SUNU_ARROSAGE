import { Routes } from '@angular/router';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { HistoriquesComponent } from './historiques/historiques.component';
import { DashbordComponent } from './dashbord/dashbord.component';
import { EditComponent } from './edit/edit.component';
import { LoginbycodeComponent } from './loginbycode/loginbycode.component';
import { AuthGuard } from './auth.guard'; // Import du guard



export const routes: Routes = [
    {path: 'utilisateur', component: UtilisateurComponent, canActivate: [AuthGuard]},
    {path: 'navbar', component: NavbarComponent, canActivate: [AuthGuard]},
    {path: 'sidebar', component: SidebarComponent, canActivate: [AuthGuard]},
    {path: 'inscription', component: InscriptionComponent, canActivate: [AuthGuard]},
    {path: 'historiques', component: HistoriquesComponent, canActivate: [AuthGuard]},
    {path: 'dashbord', component: DashbordComponent, canActivate: [AuthGuard]},
    {path: 'edit/:id', component: EditComponent, canActivate: [AuthGuard]},
    { path: '', redirectTo: 'loginbycode', pathMatch: 'full' },
    {path: 'loginbycode', component: LoginbycodeComponent}, // La page de login n'a pas besoin du guard

   



];
