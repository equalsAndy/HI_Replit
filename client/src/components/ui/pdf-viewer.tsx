import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
  downloadUrl?: string;
}

export function PDFViewer({ pdfUrl, title, onClose }: PDFViewerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-11/12 h-5/6 max-w-4xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <Button variant="outline" size="sm" onClick={onClose} title="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* PDF Content with Browser Native Controls */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="flex justify-center items-center h-full">
            <iframe
              src={`${pdfUrl}#view=FitH&pagemode=none&toolbar=1`}
              className="w-full h-full min-h-[600px] border-0 rounded shadow-lg bg-white"
              title={title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}