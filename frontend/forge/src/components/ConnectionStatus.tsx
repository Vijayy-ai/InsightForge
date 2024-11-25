import React from 'react';
import { FiDatabase, FiCheck, FiX } from 'react-icons/fi';
import { ConnectionStatus } from '@/types/database';

interface ConnectionStatusProps {
  status: ConnectionStatus;
  onDisconnect?: () => void;
}

export default function ConnectionStatusIndicator({ status, onDisconnect }: ConnectionStatusProps) {
  return (
    <div className="flex items-center space-x-2 p-2 rounded-md bg-gray-50 border">
      <FiDatabase className={`h-5 w-5 ${status.connected ? 'text-green-500' : 'text-red-500'}`} />
      <span className={status.connected ? 'text-green-700' : 'text-red-700'}>
        {status.connected ? 'Connected' : 'Disconnected'}
      </span>
      {status.connected && status.connectionId && (
        <>
          <span className="text-gray-500">|</span>
          <span className="text-sm text-gray-600">ID: {status.connectionId}</span>
          {onDisconnect && (
            <button
              onClick={onDisconnect}
              className="ml-2 p-1 hover:bg-red-100 rounded-full"
              aria-label="Disconnect database"
            >
              <FiX className="h-4 w-4 text-red-500" />
            </button>
          )}
        </>
      )}
    </div>
  );
} 