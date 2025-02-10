
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SensorServiceTsService ,SensorData} from '../services/sensor.service.ts.service';
import { Subscription } from 'rxjs';
import { CapteurPipe } from '../pipes/capteur.pipe';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-sensor',
  standalone: true,
  imports: [CapteurPipe ],
  templateUrl: './sensor.component.html',
  styleUrl: './sensor.component.css',
   providers:[SensorServiceTsService,CapteurPipe]
})
export class SensorComponent// implements OnInit, OnDestroy
 {
  sensorData$: Observable<SensorData>;

  constructor(private SensorServiceTsService: SensorServiceTsService) {
    this.sensorData$ = this.SensorServiceTsService.getSensorData();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.SensorServiceTsService.disconnect();
  }
}

