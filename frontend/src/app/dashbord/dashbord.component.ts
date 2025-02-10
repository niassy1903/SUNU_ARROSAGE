import { ChangeDetectionStrategy,Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { SensorComponent } from '../sensor/sensor.component';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { PlaningService } from '../services/planing.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { PipeTransform,Pipe } from '@angular/core';
import { CurrentTimePipe } from '../pipes/current-time.pipe';
import { IrrigationData,IrrigationService } from '../services/irrigation.service';
import { TimeCountdownPipePipe } from '../pipes/time-countdown.pipe.pipe';
import { PompeService } from '../services/pompe.service';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Subscription } from 'rxjs';
import { SensorServiceTsService } from '../services/sensor.service.ts.service';
import { ScheduleMonitorService } from '../services/schedule-monitor.service';
import { CapteurPipe } from '../pipes/capteur.pipe';

@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, HttpClientModule,FormsModule,CommonModule,CurrentTimePipe,TimeCountdownPipePipe,CapteurPipe],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
  
  
})


export class DashbordComponent implements OnInit {
  startTime: string = '';
  endTime: string = '';
  schedules: Array<{ _id?: string, startTime: string, endTime: string }> = []; // Ajoutez _id pour la suppression
  nextWateringTime: string = '';
  countdown: string = '';
  currentDateTime: string = ''; 
  private timerInterval: any;
  
  private sensorDataSubscription: Subscription | null = null;

  private destroyed = false;
  isPompeOn: boolean = false;

  constructor(private irrigationService: IrrigationService,
    private PlaningService:PlaningService,
    private PompeService:PompeService,
    private scheduleMonitorService: ScheduleMonitorService,

    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadChartData();
    this.loadSchedules();
   
    this.PompeService.pumpState$.subscribe(
      state => this.isPompeOn = state
    );
    
   
  }

 
  
  ngOnDestroy() {
   
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.destroyed = true;
  }


  
  loadChartData() {
  this.irrigationService.getLastSevenDaysMeans().subscribe({
    next: (data: IrrigationData[]) => {
      console.log('Données reçues:', data);
      
      const labels = this.getWeekDaysLabels();
      const humidityData = this.fillMissingData(labels, data);
      const luminosityData = this.fillMissingLuminosityData(labels, data);
      
      console.log('Données d\'humidité traitées:', humidityData);
      console.log('Données de luminosité traitées:', luminosityData);
      
      this.createHumidityChart(labels, humidityData);
      this.createLuminosityChart(labels, luminosityData);
     
    },
    error: (err) => {
      console.error('Erreur lors de la récupération des données:', err);
    }
  });
}
// Fonction pour générer les étiquettes des jours de la semaine
getWeekDaysLabels(): string[] {
  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  return daysOfWeek;
}

// Fonction pour combler les données manquantes
fillMissingData(labels: string[], data: IrrigationData[]): number[] {
  const filledData: number[] = [];
  
  labels.forEach((label) => {
    // Convertir le label en minuscules pour éviter les problèmes de casse
    const labelLowerCase = label.toLowerCase();
    
    const entry = data.find(entry => {
      const entryDay = new Date(entry.date_arrosage)
        .toLocaleDateString('fr-FR', { weekday: 'long' })
        .toLowerCase();
      return entryDay === labelLowerCase;
    });
    
    // Si on trouve une entrée, on utilise sa valeur, sinon on met 0
    filledData.push(entry ? entry.moyenne_humiditer : 0);
  });
  
  return filledData;
}

fillMissingLuminosityData(labels: string[], data: IrrigationData[]): number[] {
  const filledData: number[] = [];
  
  labels.forEach((label) => {
    const labelLowerCase = label.toLowerCase();
    
    const entry = data.find(entry => {
      const entryDay = new Date(entry.date_arrosage)
        .toLocaleDateString('fr-FR', { weekday: 'long' })
        .toLowerCase();
      return entryDay === labelLowerCase;
    });
    
    filledData.push(entry ? entry.moyenne_luminositer : 0); // Assurez-vous que le nom de la propriété est correct
  });
  
  return filledData;
}

createHumidityChart(labels: string[], data: number[]) {
  new Chart("humidityChart", {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Humidité moyenne",
        data: data,
        backgroundColor: ["#a78bfa", "#34d399", "#1e3a8a", "#000", "#93c5fd", "#4ade80","#E26169"],
        hoverBackgroundColor: ["#000090", "#34d39990", "#1e3a8a90", "#09090", "#93c5fd90", "#4ade8090", "#E2616990"],
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Humidité moyenne (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Jour de la semaine'
          }
        }
      }
    }
  });
}

createLuminosityChart(labels: string[], data: number[]) {
  new Chart("luminosityChart", {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Luminosité moyenne",
        data: data,
        borderColor: "#f43f5e",
        fill: true,
        backgroundColor: "rgba(244,63,94,0.2)"
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Luminosité moyenne (lx)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Jour de la semaine'
          }
        }
      }
    }
  });
}


  // Méthodes pour gérer les horaires
 

  clearTime() {
    this.schedules = []; // Efface toutes les planifications
  }


  //planification horaire 
  // Charger les horaires depuis le backend
  loadSchedules() {
    this.PlaningService.getSchedules().subscribe({
      next: (data: any) => {
        this.schedules = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des horaires', err);
      }
    });
  }

  // Ajouter un horaire
  validateTime() {
    if (this.startTime && this.endTime) {
      this.PlaningService.addSchedule(this.startTime, this.endTime).subscribe({
        next: (data: any) => {
          this.schedules.push(data); // Ajouter à la liste
          this.startTime = '';
          this.endTime = '';
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de l\'horaire', err);
        }
      });
    }
  }

  // Supprimer un horaire
  deleteSchedule(id: string | undefined) {
    if (id) {  // Vérifie si l'ID est défini et non `undefined`
      this.PlaningService.deleteSchedule(id).subscribe({
        next: () => {
          this.schedules = this.schedules.filter(schedule => schedule._id !== id); // Retirer de la liste
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de l\'horaire', err);
        }
      });
    } else {
      console.error('L\'ID est undefined, suppression impossible.');
    }
  }
  
  //fonction pour le bouton switch
//dasbord.ts
// Fonction pour basculer l'état de la pompe
togglePompe() {
  const newState = !this.isPompeOn;
  this.PompeService.togglePump(newState).subscribe({
    next: (response) => {
      if (response.success) {
        console.log('Pompe état changé:', response.state);
        // L'état sera mis à jour via le BehaviorSubject dans le service
      } else {
        console.error('Erreur lors du changement d\'état');
        this.isPompeOn = !newState; // Revenir à l'état précédent en cas d'erreur
      }
    },
    error: (error) => {
      console.error('Erreur:', error);
      this.isPompeOn = !newState; // Revenir à l'état précédent en cas d'erreur
    }
  });
}

}