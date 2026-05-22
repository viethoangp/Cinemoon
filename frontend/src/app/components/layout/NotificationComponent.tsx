import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertCircle, InfoIcon, AlertTriangle, X } from 'lucide-react';

export const NotificationComponent = () => {
  const { notifications, removeNotification } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
      default:
        return <InfoIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50';
      case 'error':
        return 'bg-red-500/20 border-red-500/50';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50';
      case 'info':
      default:
        return 'bg-blue-500/20 border-blue-500/50';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`${getBackgroundColor(notif.type)} border rounded-lg p-4 flex items-start gap-3 backdrop-blur-sm pointer-events-auto animate-in slide-in-from-top-2 fade-in duration-300`}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(notif.type)}</div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">{notif.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notif.id)}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
