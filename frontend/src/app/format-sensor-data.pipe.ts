import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'formatSensorData',
  standalone: true
})
export class FormatSensorDataPipe implements PipeTransform {
  transform(value: string, type: 'humidity' | 'luminosity'): string {
    if (!value) return '';

    // Logique de formatage pour l'humidité
    if (type === 'humidity') {
      const humidityValue = value.split(':')[1]?.trim();
      return humidityValue ? `${humidityValue}%` : '0%';
    }

    // Logique de formatage pour la luminosité
    if (type === 'luminosity') {
      const luminosityValue = value.split(':')[1]?.trim();
      return luminosityValue ? `${luminosityValue} lx` : '0 lx';
    }

    return value.trim(); // Par défaut, retourne la valeur sans formatage spécifique
  }
}