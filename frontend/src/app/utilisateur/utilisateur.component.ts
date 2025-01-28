import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

interface User {
  name: string;
  email: string;
  role: string;
  phone: string;
}

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UtilisateurComponent implements OnInit {
  users: User[] = [
    { name: 'Nicholas Patrick', email: 'patrick@gmail.com', role: 'thiaroye', phone: '778426930' },
    { name: 'Cordell Edwards', email: 'kine@gmail.com', role: 'medina', phone: '778426931' },
    { name: 'Derrick Spencer', email: 'niass@gmail.com', role: 'keur massar', phone: '778426932' },
    { name: 'Larissa Burton', email: 'patric@gmail.com', role: 'maristes', phone: '778426933' },
    { name: 'Nicholas Patrick', email: 'test@gmail.com', role: 'pikine', phone: '778426934' },
    { name: 'Nicholas Patrick', email: 'yes@gmail.com', role: 'liberte6', phone: '778426935' },
    { name: 'Nicholas Patrick', email: 'nicks87@gmail.com', role: 'ouakam', phone: '778426936' },
    { name: 'Cordell Edwards', email: 'cordell@gmail.com', role: 'yoff', phone: '778426937' },
    { name: 'Nicholas Patrick', email: 'patrick@gmail.com', role: 'thiaroye', phone: '778426938' },
    { name: 'Cordell Edwards', email: 'kine@gmail.com', role: 'medina', phone: '778426939' },
    { name: 'Nicholas Patrick', email: 'patrick@gmail.com', role: 'thiaroye', phone: '778426930' },
    { name: 'Cordell Edwards', email: 'kine@gmail.com', role: 'medina', phone: '778426931' },
    { name: 'Derrick Spencer', email: 'niass@gmail.com', role: 'keur massar', phone: '778426932' },
    { name: 'Larissa Burton', email: 'patric@gmail.com', role: 'maristes', phone: '778426933' },
    { name: 'Nicholas Patrick', email: 'test@gmail.com', role: 'pikine', phone: '778426934' },
    { name: 'Nicholas Patrick', email: 'yes@gmail.com', role: 'liberte6', phone: '778426935' },
    { name: 'Nicholas Patrick', email: 'nicks87@gmail.com', role: 'ouakam', phone: '778426936' },
    { name: 'Cordell Edwards', email: 'cordell@gmail.com', role: 'yoff', phone: '778426937' },
    { name: 'Nicholas Patrick', email: 'patrick@gmail.com', role: 'thiaroye', phone: '778426938' },
    { name: 'Cordell Edwards', email: 'kine@gmail.com', role: 'medina', phone: '778426939' },
    { name: 'Nicholas Patrick', email: 'yes@gmail.com', role: 'liberte6', phone: '778426935' },
    { name: 'Nicholas Patrick', email: 'nicks87@gmail.com', role: 'ouakam', phone: '778426936' },
    { name: 'Cordell Edwards', email: 'cordell@gmail.com', role: 'yoff', phone: '778426937' },
    { name: 'Nicholas Patrick', email: 'patrick@gmail.com', role: 'thiaroye', phone: '778426938' },
    { name: 'Cordell Edwards', email: 'kine@gmail.com', role: 'medina', phone: '778426939' },
    { name: 'Nicholas Patrick', email: 'patrick@gmail.com', role: 'thiaroye', phone: '778426930' },
    { name: 'Cordell Edwards', email: 'kine@gmail.com', role: 'medina', phone: '778426931' },
    { name: 'Derrick Spencer', email: 'niass@gmail.com', role: 'keur massar', phone: '778426932' },
    { name: 'Larissa Burton', email: 'patric@gmail.com', role: 'maristes', phone: '778426933' },
    { name: 'Nicholas Patrick', email: 'test@gmail.com', role: 'pikine', phone: '778426934' },
    { name: 'Nicholas Patrick', email: 'yes@gmail.com', role: 'liberte6', phone: '778426935' },
    { name: 'Nicholas Patrick', email: 'nicks87@gmail.com', role: 'ouakam', phone: '778426936' },
    { name: 'Cordell Edwards', email: 'cordell@gmail.com', role: 'yoff', phone: '778426937' },
    { name: 'Nicholas Patrick', email: 'patrick@gmail.com', role: 'thiaroye', phone: '778426938' },
    { name: 'Cordell Edwards', email: 'kine@gmail.com', role: 'medina', phone: '778426939' }
  ];
  paginatedUsers: User[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 13;
  totalPages: number = 0;

  ngOnInit(): void {
    this.filterAndPaginateUsers();
  }

  filterAndPaginateUsers(): void {
    let filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.totalPages = Math.ceil(filteredUsers.length / this.itemsPerPage);
    this.paginatedUsers = filteredUsers.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page < 1) {
      page = 1;
    } else if (page > this.totalPages) {
      page = this.totalPages;
    }
    this.currentPage = page;
    this.filterAndPaginateUsers();
  }

  addUser(): void {
    // Logic to add a new user
    console.log('Add user button clicked');
  }

  deleteUser(user: User): void {
    // Logic to delete a user
    console.log('Delete user button clicked for user:', user);
  }

  editUser(user: User): void {
    // Logic to edit a user
    console.log('Edit user button clicked for user:', user);
  }
}
