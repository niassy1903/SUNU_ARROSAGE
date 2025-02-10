import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'formatSensorData',
  standalone: true
})
export class FormatSensorDataPipe implements PipeTransform {
  transform(value: string, type: string): string {
    if (!value) return '0';

    switch (type) {
      case 'humidity':
        return `${value}%`;
      case 'luminosity':
        return `${value} lx`;
      default:
        return value;
    }
  }
}