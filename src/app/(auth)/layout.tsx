import { AppHeader } from '@/components/layout/app-header';
import styles from './layout.module.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.root}>
      <AppHeader />
      <main id="contenido" tabIndex={-1} className={styles.main}>{children}</main>
    </div>
  );
}
