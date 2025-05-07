import { ReactNode } from "react";

interface MainContainerProps {
  children: ReactNode;
}

export default function MainContainer({ children }: MainContainerProps) {
  return (
    <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 flex-1">
      {children}
    </main>
  );
}

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function LeftPanel({ children, className = "" }: PanelProps) {
  return (
    <div className={`w-full md:w-1/2 bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

export function RightPanel({ children, className = "" }: PanelProps) {
  return (
    <div className={`w-full md:w-1/2 bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}
