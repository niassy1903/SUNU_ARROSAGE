
import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { NavbarComponent } from '../navbar/navbar.component';
@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [SidebarComponent,NavbarComponent],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.css',
  
})
export class DashbordComponent implements AfterViewInit {




  ngAfterViewInit() {
    this.createHumidityChart();
    this.createWaterChart();
    this.createLuminosityChart();
  }

  createHumidityChart() {
    new Chart("humidityChart", {
      type: "bar",
      data: {
        labels: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi","Dimanche"],
        datasets: [{
          label: "Humidité",
          data: [10, 30, 20, 40, 15, 25,17],
          backgroundColor: ["#a78bfa", "#34d399", "#1e3a8a", "#000", "#93c5fd", "#4ade80","E26169"]
        }]
      }
    });
  }

  createWaterChart() {
    new Chart("waterChart", {
      type: "doughnut",
      data: {
        labels: ["Arachide", "Aloe Vera", "Maïs", "Sorgo"],
        datasets: [{
          data: [52.1, 22.8, 13.9, 11.2],
          backgroundColor: ["#000", "#93c5fd", "#4ade80", "#34d399"]
        }]
      }
    });
  }

  createLuminosityChart() {
    new Chart("luminosityChart", {
      type: "line",
      data: {
        labels: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi","Dimanche"],
        datasets: [{
          label: "Luminosité",
          data: [30, 40, 25, 35, 50, 40,16],
          borderColor: "#f43f5e",
          fill: true,
          backgroundColor: "rgba(244,63,94,0.2)"
        }]
      }
    });
  }
}