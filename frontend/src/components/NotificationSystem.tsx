import React, { useState, useEffect } from 'react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  
  useEffect(() => {
    // Registra um listener para notificações do backend
    const eventSource = new EventSource('/api/notifications');
    
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
      
      // Mostra notificação do sistema
      if (Notification.permission === 'granted') {
        new Notification('City Sense', {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    };
    
    return () => eventSource.close();
  }, []);
  
  // Solicita permissão para notificações
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);
  
  return (
    <div className="fixed bottom-6 right-6 space-y-2 z-50">
      {notifications.map((n, i) => (
        <div 
          key={i}
          className={`p-4 rounded-xl shadow-lg max-w-sm ${
            n.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
            n.type === 'alert' ? 'bg-red-50 border-l-4 border-red-500' :
            'bg-blue-50 border-l-4 border-blue-500'
          }`}
          role="alert"
        >
          <p className="text-sm">{n.message}</p>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem;