import { Routes } from '@angular/router';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { HistoriquesComponent } from './historiques/historiques.component';
import { DashbordComponent } from './dashbord/dashbord.component';
import { EditComponent } from './edit/edit.component';
import { LoginbycodeComponent } from './loginbycode/loginbycode.component';


export const routes: Routes = [
    {path: 'utilisateur', component: UtilisateurComponent},
    {path: 'navbar', component: NavbarComponent},
    {path: 'sidebar', component: SidebarComponent},
    {path: 'inscription', component: InscriptionComponent},
    {path: 'historiques',component: HistoriquesComponent},
    {path: 'dashbord',component: DashbordComponent},
    {path: 'edit/:id', component: EditComponent},
    {path: 'loginbycode', component: LoginbycodeComponent},
];
