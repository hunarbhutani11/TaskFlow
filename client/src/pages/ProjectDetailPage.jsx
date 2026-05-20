import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Search, Users, ListTodo, UserPlus, X } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import TaskCard from '../components/shared/TaskCard';
import TaskModal from '../components/shared/TaskModal';
import MemberAvatar from '../components/shared/MemberAvatar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import useAuth from '../hooks/useAuth';
import { useProject, useAddMember, useRemoveMember } from '../hooks/useProjects';
import { useTasks, useCreateTask, useUpdateTask, useUpdateTaskStatus, useDeleteTask } from '../hooks/useTasks';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api/users';
import { cn } from '../utils/cn';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Data fetching
  const { data: project, isLoading: projectLoading } = useProject(id);

  // Filters state
  const [filters, setFilters] = useState({ status: '', priority: '', assigneeId: '', search: '' });
  const { data: tasks, isLoading: tasksLoading } = useTasks(id, filters);

  // All users for adding members (admin only)
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const data = await getUsers();
      return data.users;
    },
    enabled: isAdmin,
  });

  // Mutations
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const addMember = useAddMember();
  const removeMember = useRemoveMember();

  // Modal states
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [membersExpanded, setMembersExpanded] = useState(false);
  const [addMemberDropdown, setAddMemberDropdown] = useState(false);

  // Available users to add (not already members)
  const availableUsers = useMemo(() => {
    if (!usersData || !project?.members) return [];
    const memberIds = new Set(project.members.map((m) => m.id));
    return usersData.filter((u) => !memberIds.has(u.id));
  }, [usersData, project?.members]);

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <PageWrapper>
        <EmptyState title="Project not found" description="The project you're looking for doesn't exist." />
      </PageWrapper>
    );
  }

  const handleCreateTask = async (data) => {
    await createTask.mutateAsync({ projectId: id, data });
  };

  const handleUpdateTask = async (data) => {
    await updateTask.mutateAsync({ taskId: editingTask.id, data });
    setEditingTask(null);
  };

  const handleStatusChange = async (taskId, status) => {
    await updateTaskStatus.mutateAsync({ taskId, status });
  };

  const handleDeleteTask = async () => {
    await deleteTask.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleAddMember = async (userId) => {
    await addMember.mutateAsync({ projectId: id, userId });
    setAddMemberDropdown(false);
  };

  const handleRemoveMember = async (userId) => {
    await removeMember.mutateAsync({ projectId: id, userId });
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priority' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
  ];

  const assigneeOptions = [
    { value: '', label: 'All Members' },
    ...(project.members || []).map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <PageWrapper>
      {/* Back Button + Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">{project.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5" />
                {project.members?.length || 0} members
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ListTodo className="w-3.5 h-3.5" />
                {project.tasks?.length || 0} tasks
              </div>
            </div>
          </div>

          {isAdmin && (
            <Button onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}>
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Members Panel */}
      <div className="mb-6">
        <button
          onClick={() => setMembersExpanded(!membersExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors mb-3"
        >
          <Users className="w-4 h-4" />
          Team Members ({project.members?.length || 0})
          <span className="text-xs text-slate-500">{membersExpanded ? '▾' : '▸'}</span>
        </button>

        {membersExpanded && (
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 animate-fade-in">
            <div className="flex flex-wrap gap-3 items-center">
              {project.members?.map((member) => (
                <div key={member.id} className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-3 py-2">
                  <MemberAvatar name={member.name} size="xs" />
                  <span className="text-sm text-slate-300">{member.name}</span>
                  <Badge variant={member.role === 'ADMIN' ? 'primary' : 'default'} className="text-[10px]">
                    {member.role}
                  </Badge>
                  {isAdmin && member.id !== user.id && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="ml-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove member"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {/* Add member button */}
              {isAdmin && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddMemberDropdown(!addMemberDropdown)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add
                  </Button>

                  {addMemberDropdown && availableUsers.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto animate-scale-in">
                      {availableUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handleAddMember(u.id)}
                          className="w-full px-4 py-2.5 text-sm text-left text-slate-300 hover:bg-slate-700/80 flex items-center gap-2 transition-colors"
                        >
                          <MemberAvatar name={u.name} size="xs" />
                          <div>
                            <p className="text-sm">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {addMemberDropdown && availableUsers.length === 0 && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 p-4 animate-scale-in">
                      <p className="text-xs text-slate-500 text-center">All users are already members</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-sm text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
          >
            {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-sm text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
          >
            {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filters.assigneeId}
            onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value })}
            className="hidden sm:block px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-sm text-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none"
          >
            {assigneeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Tasks */}
      {tasksLoading ? (
        <div className="flex items-center justify-center h-32">
          <Spinner />
        </div>
      ) : tasks?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={(t) => {
                setEditingTask(t);
                setTaskModalOpen(true);
              }}
              onDelete={(t) => setDeleteTarget(t)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ListTodo}
          title={filters.search || filters.status || filters.priority || filters.assigneeId ? 'No tasks match filters' : 'No tasks yet'}
          description={
            filters.search || filters.status || filters.priority || filters.assigneeId
              ? 'Try adjusting your filters.'
              : isAdmin
                ? 'Create the first task for this project.'
                : 'No tasks have been assigned to you in this project.'
          }
          action={
            isAdmin && !filters.search && !filters.status && !filters.priority ? (
              <Button onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}>
                <Plus className="w-4 h-4" />
                Create Task
              </Button>
            ) : null
          }
        />
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        members={project.members || []}
        isLoading={createTask.isPending || updateTask.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        isLoading={deleteTask.isPending}
      />
    </PageWrapper>
  );
}
