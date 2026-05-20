import { useState } from 'react';
import { Search, Plus, FolderKanban } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import ProjectCard from '../components/shared/ProjectCard';
import ProjectModal from '../components/shared/ProjectModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import useAuth from '../hooks/useAuth';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';

export default function ProjectsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = (projects || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data) => {
    await createProject.mutateAsync(data);
  };

  const handleUpdate = async (data) => {
    await updateProject.mutateAsync({ id: editingProject.id, data });
    setEditingProject(null);
  };

  const handleDelete = async () => {
    await deleteProject.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <PageWrapper>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
          <p className="text-sm text-slate-400 mt-1">
            {projects?.length || 0} {(projects?.length || 0) === 1 ? 'project' : 'projects'} total
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200"
            />
          </div>

          {isAdmin && (
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Project</span>
            </Button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => {
                setEditingProject(p);
                setModalOpen(true);
              }}
              onDelete={(p) => setDeleteTarget(p)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title={search ? 'No projects found' : 'No projects yet'}
          description={
            search
              ? `No projects match "${search}". Try a different search term.`
              : isAdmin
                ? 'Create your first project to get started.'
                : 'You have not been added to any projects yet.'
          }
          action={
            isAdmin && !search ? (
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Create Project
              </Button>
            ) : null
          }
        />
      )}

      {/* Create/Edit Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={editingProject ? handleUpdate : handleCreate}
        project={editingProject}
        isLoading={createProject.isPending || updateProject.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all tasks in this project.`}
        isLoading={deleteProject.isPending}
      />
    </PageWrapper>
  );
}
