// composables/useTimeAgo.ts

export const useTimeAgo = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Moins d'une minute
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  }
  
  // Moins d'une heure
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }
  
  // Moins d'un jour
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }
  
  // Plus d'un jour
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}j`;
  }

  // Si c'est plus vieux qu'une semaine, on affiche la date courte (ex: 12/04/2024)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};