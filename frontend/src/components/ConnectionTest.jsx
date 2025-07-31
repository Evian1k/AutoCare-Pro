import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const ConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    status: 'testing',
    message: 'Testing connection...',
    details: null,
    timestamp: null
  });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus({
      status: 'testing',
      message: 'Testing connection...',
      details: null,
      timestamp: new Date().toLocaleString()
    });

    try {
      const result = await apiService.testConnection();
      
      if (result.success) {
        setConnectionStatus({
          status: 'success',
          message: 'Backend connection successful!',
          details: result.data,
          timestamp: new Date().toLocaleString()
        });
      } else {
        setConnectionStatus({
          status: 'error',
          message: 'Backend connection failed',
          details: result.error,
          timestamp: new Date().toLocaleString()
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: 'Connection test failed',
        details: error.message,
        timestamp: new Date().toLocaleString()
      });
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'testing': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'success': 
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'testing':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            Frontend ↔ Backend Connection Test
          </h2>
        </div>

        <div className="p-6">
          <div className={`rounded-xl border-2 p-4 ${getStatusColor()}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div className="flex-1">
                <h3 className="font-semibold">{connectionStatus.message}</h3>
                {connectionStatus.timestamp && (
                  <p className="text-sm opacity-75 mt-1">
                    Last tested: {connectionStatus.timestamp}
                  </p>
                )}
              </div>
            </div>

            {connectionStatus.details && (
              <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
                <h4 className="font-medium mb-2">Details:</h4>
                <pre className="text-sm overflow-x-auto">
                  {typeof connectionStatus.details === 'object' 
                    ? JSON.stringify(connectionStatus.details, null, 2)
                    : connectionStatus.details
                  }
                </pre>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={testConnection}
              disabled={connectionStatus.status === 'testing'}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {connectionStatus.status === 'testing' ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Testing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Test Again
                </>
              )}
            </button>
          </div>

          {/* API Endpoints Status */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Health Check', endpoint: '/api/health' },
                { name: 'Authentication', endpoint: '/api/login' },
                { name: 'Vehicles', endpoint: '/api/vehicles' },
                { name: 'Services', endpoint: '/api/services' },
                { name: 'Appointments', endpoint: '/api/appointments' },
                { name: 'Incident Reports', endpoint: '/api/incident-reports' },
                { name: 'Parts', endpoint: '/api/parts' },
                { name: 'File Upload', endpoint: '/api/upload' }
              ].map((api) => (
                <div key={api.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{api.name}</span>
                  <span className="text-xs font-mono text-gray-500">{api.endpoint}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-2">Connection Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Frontend URL: <span className="font-mono">http://localhost:3000</span></div>
              <div>Backend URL: <span className="font-mono">http://localhost:5000</span></div>
              <div>Proxy: <span className="font-mono">Enabled via package.json</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;