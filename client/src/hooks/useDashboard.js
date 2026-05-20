import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getDashboardCharts, getOverdueTasks, getRecentActivity } from '../api/dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const data = await getDashboardStats();
      return data;
    },
  });
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: async () => {
      const data = await getDashboardCharts();
      return data;
    },
  });
}

export function useOverdueTasks() {
  return useQuery({
    queryKey: ['dashboard', 'overdue'],
    queryFn: async () => {
      const data = await getOverdueTasks();
      return data.tasks;
    },
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => {
      const data = await getRecentActivity();
      return data.activities;
    },
  });
}
