'use client';

import { useParams } from 'next/navigation';
import { PublicListAccess } from '@/features/invitations/components/public-list-access';
import { Suspense } from 'react';
import { GeneralLoading } from '@/components/layout';

function PublicInvitationPage() {
  const params = useParams();
  const token = params.token as string;

  if (!token) {
    return <GeneralLoading />;
  }

  return <PublicListAccess token={token} />;
}

export default function SuspendedPublicInvitationPage() {
  return (
    <Suspense fallback={<GeneralLoading />}>
      <PublicInvitationPage />
    </Suspense>
  );
}
