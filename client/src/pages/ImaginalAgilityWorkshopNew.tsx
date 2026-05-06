import React from 'react';
import ImaginalAgilityWorkshop from '@/components/workshops/ImaginalAgilityWorkshop';
import IABetaNoticeModal from '@/components/modals/IABetaNoticeModal';
import { useIABetaNotice } from '@/hooks/use-ia-beta-notice';

export default function ImaginalAgilityWorkshopNewPage() {
  const { showModal, handleClose } = useIABetaNotice();

  return (
    <>
      <ImaginalAgilityWorkshop />
      <IABetaNoticeModal isOpen={showModal} onClose={handleClose} />
    </>
  );
}