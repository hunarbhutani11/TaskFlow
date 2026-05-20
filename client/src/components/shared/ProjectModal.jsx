import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '../../schemas/project.schema';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function ProjectModal({ isOpen, onClose, onSubmit, project, isLoading }) {
  const isEditing = !!project;

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
    },
  });

  const onFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Create New Project'}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
        <Input
          id="project-name"
          label="Project Name"
          placeholder="Enter project name..."
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="space-y-1.5">
          <label htmlFor="project-desc" className="block text-sm font-medium text-slate-300">
            Description
          </label>
          <textarea
            id="project-desc"
            rows={3}
            placeholder="Describe the project..."
            className="w-full rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 hover:border-slate-600 resize-none"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-rose-400">{errors.description.message}</p>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {isEditing ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
