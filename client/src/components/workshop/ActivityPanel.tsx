import React from 'react';

type Props = {
  title?: string;
  className?: string;
  children: React.ReactNode;
};

export default function ActivityPanel({ title, className = '', children }: Props) {
  return (
    <section className={`w-full max-w-3xl mx-auto ${className}`}>
      {title ? (
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">{title}</h1>
        </header>
      ) : null}
      <div className="bg-white rounded-2xl shadow p-6">
        {children}
      </div>
    </section>
  );
}

