import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    case 'graduated':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getProgramColor(program: string): string {
  const colors: Record<string, string> = {
    'Graphic Design': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Interior Design': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    'Game Development': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    '3D Design': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    'Multimedia': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    'Animation': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Illustration': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
    'Copywriting': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  };
  return colors[program] || 'bg-gray-100 text-gray-800';
}
