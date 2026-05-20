import { useNavigate } from 'react-router-dom';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import DropdownMenu from '../ui/DropdownMenu';
import MemberAvatar from './MemberAvatar';
import { formatDate } from '../../utils/date';
import useAuth from '../../hooks/useAuth';
import { cn } from '../../utils/cn';

export default function ProjectCard({ project, onEdit, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const progress = project.totalTasks > 0
    ? Math.round((project.doneTasks / project.totalTasks) * 100)
    : 0;

  const displayMembers = (project.members || []).slice(0, 3);
  const overflowCount = Math.max(0, (project.members || []).length - 3);

  const menuItems = [
    { label: 'Edit', icon: Edit, onClick: () => onEdit(project) },
    { label: 'Delete', icon: Trash2, onClick: () => onDelete(project), danger: true },
  ];

  return (
    <Card
      className="group cursor-pointer hover:border-slate-700/80 hover:shadow-xl hover:shadow-primary-500/5"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold text-slate-100 group-hover:text-primary-400 transition-colors truncate pr-2">
            {project.name}
          </h3>
          {isAdmin && (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu items={menuItems} />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 line-clamp-2 mb-4 min-h-[40px]">
          {project.description || 'No description provided.'}
        </p>

        {/* Members */}
        <div className="flex items-center gap-1 mb-4">
          <div className="flex -space-x-2">
            {displayMembers.map((member) => (
              <MemberAvatar key={member.id} name={member.name} size="xs" />
            ))}
          </div>
          {overflowCount > 0 && (
            <span className="text-xs text-slate-500 ml-2">+{overflowCount} more</span>
          )}
          <span className="text-xs text-slate-600 ml-auto">
            {project.totalTasks} {project.totalTasks === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Progress</span>
            <span className="text-xs font-medium text-slate-400">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                progress === 100
                  ? 'bg-emerald-500'
                  : progress > 50
                    ? 'bg-primary-500'
                    : 'bg-primary-600'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Created {formatDate(project.createdAt)}</span>
        </div>
      </div>
    </Card>
  );
}
