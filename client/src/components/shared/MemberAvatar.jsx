import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';

export default function MemberAvatar({ name, size = 'sm' }) {
  return (
    <Tooltip content={name}>
      <Avatar name={name} size={size} />
    </Tooltip>
  );
}
