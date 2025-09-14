'use client';

import { useEffect, useState } from 'react';
import { formatDateTime } from '@/lib/utils/formatting';

interface AuditLog {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  metadata?: any;
  timestamp: string;
}

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchAuditLogs();
  }, []);
  
  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/admin/audit-logs');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <div>Loading audit logs...</div>;
  }
  
  return (
    <div className="space-y-2">
      {logs.length === 0 ? (
        <p className="text-muted-foreground">No audit logs found</p>
      ) : (
        logs.map((log) => (
          <div key={log.id} className="p-3 border rounded-lg text-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold">{log.action}</span>
                {log.entityType && (
                  <span className="ml-2 text-muted-foreground">
                    {log.entityType} {log.entityId && `#${log.entityId.slice(0, 8)}`}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(log.timestamp)}
              </span>
            </div>
            {log.metadata && (
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            )}
          </div>
        ))
      )}
    </div>
  );
}