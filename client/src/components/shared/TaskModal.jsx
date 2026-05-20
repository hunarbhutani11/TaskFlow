import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema } from '../../schemas/task.schema';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import useAuth from '../../hooks/useAuth';
import { formatDateForInput } from '../../utils/date';

export default function TaskModal({ isOpen, onClose, onSubmit, task, members = [], isLoading }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isEditing = !!task;

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      assignedToId: task?.assignedTo?.id || task?.assignedToId || '',
      priority: task?.priority || 'MEDIUM',
      status: task?.status || 'TODO',
      dueDate: task?.dueDate ? formatDateForInput(task.dueDate) : '',
    },
  });

  const onFormSubmit = async (data) => {
    // Clean up empty strings
    if (!data.assignedToId) data.assignedToId = null;
    if (!data.dueDate) data.dueDate = null;
    await onSubmit(data);
    reset();
    onClose();
  };

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
  ];

  const statusOptions = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      size="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
        <Input
          id="task-title"
          label="Title"
          placeholder="Enter task title..."
          error={errors.title?.message}
          disabled={!isAdmin && isEditing}
          {...register('title')}
        />

        <div className="space-y-1.5">
          <label htmlFor="task-desc" className="block text-sm font-medium text-slate-300">
            Description
          </label>
          <textarea
            id="task-desc"
            rows={3}
            placeholder="Describe the task..."
            disabled={!isAdmin && isEditing}
            className="w-full rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 hover:border-slate-600 resize-none disabled:opacity-50"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="task-assignee"
            label="Assignee"
            placeholder="Unassigned"
            options={memberOptions}
            error={errors.assignedToId?.message}
            disabled={!isAdmin && isEditing}
            {...register('assignedToId')}
          />

          <Select
            id="task-priority"
            label="Priority"
            options={priorityOptions}
            placeholder=""
            error={errors.priority?.message}
            disabled={!isAdmin && isEditing}
            {...register('priority')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            id="task-status"
            label="Status"
            options={statusOptions}
            placeholder=""
            error={errors.status?.message}
            {...register('status')}
          />

          <Input
            id="task-duedate"
            label="Due Date"
            type="date"
            error={errors.dueDate?.message}
            disabled={!isAdmin && isEditing}
            {...register('dueDate')}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
