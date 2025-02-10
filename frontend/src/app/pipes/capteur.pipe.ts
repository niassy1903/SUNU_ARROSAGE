import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capteur',
  standalone: true
})
export class CapteurPipe implements PipeTransform {
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
