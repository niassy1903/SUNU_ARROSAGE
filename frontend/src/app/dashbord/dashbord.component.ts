import { ChangeDetectionStrategy,Component, OnInit,AfterViewInit,OnDestroy } from '@angular/core';
import Chart from 'chart.js/auto';
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
import { Subscription } from 'rxjs';
import { SensorDataService } from '../sensor-data.service'; // Importer le service
import { PompeService } from '../services/pompe.service'; // Importer le service



@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, HttpClientModule,FormsModule,CommonModule,TimeCountdownPipePipe,CurrentTimePipe],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SensorDataService],
})


export class DashbordComponent implements OnInit {

  humidity: number = 0;
  luminosity: number = 0;
  volumeEau: number = 0; // Ajoutez cette ligne pour le volume d'eau

  private sensorDataSubscription: Subscription | undefined;
  private sensorDataInterval: any;
  

  isPompeOn: boolean = false;
 

  startTime: string = '';
  endTime: string = '';
  schedules: Array<{ _id?: string, startTime: string, endTime: string }> = []; // Ajoutez _id pour la suppression
  nextWateringTime: string = '';
  countdown: string = '';
  currentDateTime: string = ''; 
  private timerInterval: any;
  private destroyed = false;
  constructor(private irrigationService: IrrigationService,
    private PlaningService:PlaningService,private PompeService:PompeService,
    private cdr: ChangeDetectorRef, private sensorDataService: SensorDataService
    
  ) {}

  ngOnInit() {
    this.loadChartData();
    this.loadSchedules();
    this.fetchSensorData();
    this.sensorDataInterval = setInterval(() => this.fetchSensorData(), 2000);
   
  
  }

 
  
  ngOnDestroy() {
   
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.destroyed = true;

    if (this.sensorDataSubscription) {
      this.sensorDataSubscription.unsubscribe();
    }
    if (this.sensorDataInterval) {
      clearInterval(this.sensorDataInterval);
    }
    
  }

 

  fetchSensorData(): void {
    this.sensorDataSubscription = this.sensorDataService.getSensorData().subscribe((data: any) => {
      this.humidity = data.humidity; // Récupérer l'humidité
      this.luminosity = data.light; // Récupérer la luminosité
      this.volumeEau = data.waterLevel; // Assurez-vous que la clé 'volumeEau' existe dans les données
  
      this.cdr.markForCheck(); // Met à jour l'affichage
    });
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
  
  // Fonction pour mettre à jour la date et l'heure actuelles
 
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

//envoyer les donnerr en alument la pompe
envoyerDonnees() {
  const irrigationData = {
    humiditer: this.humidity,
    luminositer: this.luminosity,
    volume_arroser: this.volumeEau, // Ajout du volume d'eau
    type_arrosage: 'manuelle',
    pumpState: this.isPompeOn // Ajout de l'état de la pompe
  };

  this.irrigationService.envoyerIrrigation(irrigationData).subscribe(
    response => {
      console.log('Irrigation envoyée avec succès', response);
    },
    error => {
      console.error('Erreur lors de l’envoi des données', error);
    }
  );
}

}