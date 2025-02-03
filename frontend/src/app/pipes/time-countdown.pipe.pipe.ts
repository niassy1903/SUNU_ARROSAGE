
import { Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject, interval } from 'rxjs';

interface TimeDisplay {
  currentTime: string;
  countdown: string;
  nextWatering: string;
  isAlert: boolean;
}

@Pipe({
  name: 'timeCountdownPipe',
  standalone: true
})
export class TimeCountdownPipePipe implements PipeTransform {
  private readonly updateInterval = interval(1000); // Met à jour chaque seconde



  transform(schedules: Array<{ startTime: string, endTime: string }>): TimeDisplay {
    const now = new Date();
    const currentTime = now.toLocaleString('fr-FR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Trouve le prochain horaire d'arrosage
    const nextSchedule = this.findNextSchedule(schedules);
    if (!nextSchedule) {
      return {
        currentTime,
        countdown: 'Aucun arrosage planifié',
        nextWatering: '',
        isAlert: false
      };
    }

    const { countdown, isAlert } = this.calculateCountdown(nextSchedule.startTime);

    return {
      currentTime,
      countdown,
      nextWatering: nextSchedule.startTime,
      isAlert
    };
  }

  private findNextSchedule(schedules: Array<{ startTime: string, endTime: string }>) {
    if (!schedules || schedules.length === 0) return null;

    const now = new Date();
    let closestSchedule = null;
    let minDifference = Infinity;

    for (const schedule of schedules) {
      const [hours, minutes] = schedule.startTime.split(':');
      const scheduleDate = new Date();
      scheduleDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Si l'heure est passée, ajouter 24h
      if (scheduleDate < now) {
        scheduleDate.setDate(scheduleDate.getDate() + 1);
      }

      const difference = scheduleDate.getTime() - now.getTime();
      if (difference < minDifference) {
        minDifference = difference;
        closestSchedule = schedule;
      }
    }

    return closestSchedule;
  }

 private calculateCountdown(startTime: string): { countdown: string; isAlert: boolean } {
  const now = new Date();
  const [hours, minutes] = startTime.split(':');
  const targetDate = new Date();
  targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  // Si l'heure de l'arrosage est déjà passée, ajoute 24 heures
  if (targetDate < now) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const diff = targetDate.getTime() - now.getTime();
  const diffHours = Math.floor(diff / (1000 * 60 * 60)); // Calculer les heures restantes
  const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); // Calculer les minutes restantes
  const diffSeconds = Math.floor((diff % (1000 * 60)) / 1000); // Calculer les secondes restantes

  return {
    countdown: `${diffHours.toString().padStart(2, '0')}h${diffMinutes.toString().padStart(2, '0')}m${diffSeconds.toString().padStart(2, '0')}s`, // Afficher heures, minutes et secondes
    isAlert: diffHours === 0 && diffMinutes <= 5 && diffSeconds <= 10 // Si dans les 5 minutes et 10 secondes
  };
}

}
