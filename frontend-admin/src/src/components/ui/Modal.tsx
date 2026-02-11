import React, { Fragment } from 'react';
import { X } from 'lucide-react';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}: ModalProps) {
  if (!isOpen) return null;
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl'
  };
  return <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 py-8 text-center sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

        {/* Center modal */}
        <div className={`
          inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all 
          sm:my-8 w-full ${maxWidthClasses[maxWidth]}
        `}>
          <div className="bg-white px-6 pt-6 pb-5 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl leading-6 font-semibold text-gray-900" id="modal-title">
                {title}
              </h3>
              <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none" onClick={onClose}>
                <span className="sr-only">Close</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-3">{children}</div>
          </div>
        </div>
      </div>
    </div>;
}