import React, { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: ReactNode;
}

interface DialogHeaderProps {
  children: ReactNode;
}

interface DialogTitleProps {
  children: ReactNode;
}

interface DialogDescriptionProps {
  children: ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed z-50">
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({ className = '', children }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg ${className}`}>
      {children}
    </div>
  );
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return (
    <div className="flex flex-col mb-4">
      {children}
    </div>
  );
};

export const DialogTitle: React.FC<DialogTitleProps> = ({ children }) => {
  return (
    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
      {children}
    </h2>
  );
};

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children }) => {
  return (
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
      {children}
    </p>
  );
};