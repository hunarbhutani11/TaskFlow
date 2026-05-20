import Badge from '../ui/Badge';

const statusConfig = {
  TODO: { label: 'To Do', variant: 'default' },
  IN_PROGRESS: { label: 'In Progress', variant: 'primary' },
  DONE: { label: 'Done', variant: 'success' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.TODO;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
