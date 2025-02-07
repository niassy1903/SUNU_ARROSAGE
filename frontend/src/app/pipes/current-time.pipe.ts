import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currentTime',
  standalone: true,
  pure: false
})
export class CurrentTimePipe implements PipeTransform {
  transform(value?: any): string {
    const now = new Date();
    return now.toLocaleString('fr-FR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

}
