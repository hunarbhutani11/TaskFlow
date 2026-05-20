import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, 'MMM d, yyyy');
}

/**
 * Format a date string to relative time (e.g., "2 days ago").
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Check if a due date is overdue (past and not done).
 */
export function isOverdue(dateStr) {
  if (!dateStr) return false;
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return isBefore(date, new Date());
}

/**
 * Format a date for input[type="date"] value.
 */
export function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, 'yyyy-MM-dd');
}
