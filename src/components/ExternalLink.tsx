import { ExternalLink as Icon } from 'lucide-react';
import { openExternal } from '@/platform/capacitor';
import { useToast } from './toastContext';
import { useOnline } from '@/hooks/useOnline';

interface Props {
  href: string;
  children: string;
}

export function ExternalLink({ href, children }: Props) {
  const toast = useToast();
  const online = useOnline();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        void openExternal(href).then((res) => {
          if (!res.ok && (res.reason === 'offline' || !online)) {
            toast.show(
              'Internet connection required to open external sources. The guide itself remains available offline.',
            );
          }
        });
      }}
    >
      <Icon size={14} aria-hidden /> {children}
    </a>
  );
}
