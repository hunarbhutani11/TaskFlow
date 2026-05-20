import { Calendar, Edit, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import DropdownMenu from '../ui/DropdownMenu';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { formatDate, isOverdue } from '../../utils/date';
import useAuth from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE';

  const menuItems = [];
  if (isAdmin) {
    menuItems.push({ label: 'Edit', icon: Edit, onClick: () => onEdit(task) });
    menuItems.push({ label: 'Delete', icon: Trash2, onClick: () => onDelete(task), danger: true });
  }

  return (
    <Card className="hover:border-slate-700/80 transition-all duration-200">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h4 className="text-sm font-semibold text-slate-100 truncate mb-1">{task.title}</h4>
            {/* Description */}
            {task.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
            )}
          </div>
          {menuItems.length > 0 && <DropdownMenu items={menuItems} />}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/40">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            {task.assignedTo ? (
              <>
                <Avatar name={task.assignedTo.name} size="xs" />
                <span className="text-xs text-slate-400 truncate max-w-[120px]">
                  {task.assignedTo.name}
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-600 italic">Unassigned</span>
            )}
          </div>

          {/* Due date */}
          {task.dueDate && (
            <div className={cn(
              'flex items-center gap-1 text-xs',
              overdue ? 'text-rose-400' : 'text-slate-500'
            )}>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Status change for members */}
        {!isAdmin && task.assignedTo?.id === user?.id && (
          <div className="mt-3 pt-3 border-t border-slate-800/40">
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        )}
      </div>
    </Card>
  );
}
