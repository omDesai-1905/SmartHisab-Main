import API_BASE_URL from './config/api';

function DiagnosticInfo() {
  const envVars = {
    'VITE_BASE_URL': import.meta.env.VITE_BASE_URL,
    'VITE_API_URL': import.meta.env.VITE_API_URL,
    'MODE': import.meta.env.MODE,
    'DEV': import.meta.env.DEV,
    'PROD': import.meta.env.PROD,
  };

  const testBackend = async () => {
    try {
      console.log('Testing backend connection to:', API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/api/admin/verify`, {
        method: 'GET',
      });
      console.log('Backend response status:', response.status);
      const data = await response.json();
      console.log('Backend response data:', data);
      alert(`Backend test: ${response.status} - ${JSON.stringify(data)}`);
    } catch (error) {
      console.error('Backend test failed:', error);
      alert(`Backend test failed: ${error.message}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      background: '#000', 
      color: '#0f0', 
      padding: '10px', 
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <div style={{ marginBottom: '10px' }}>
        <strong>🔍 Diagnostic Info (Remove this component in production)</strong>
        <button 
          onClick={testBackend}
          style={{ 
            marginLeft: '10px', 
            background: '#0f0', 
            color: '#000', 
            border: 'none', 
            padding: '5px 10px',
            cursor: 'pointer'
          }}
        >
          Test Backend Connection
        </button>
      </div>
      <div><strong>API_BASE_URL:</strong> {API_BASE_URL || 'undefined/not set'}</div>
      <div style={{ marginTop: '5px' }}><strong>Environment Variables:</strong></div>
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key} style={{ paddingLeft: '20px' }}>
          {key}: {String(value) || 'undefined'}
        </div>
      ))}
      <div style={{ marginTop: '5px', color: '#ff0' }}>
        ⚠️ If API_BASE_URL is undefined or localhost, set VITE_BASE_URL in Vercel and redeploy!
      </div>
    </div>
  );
}

export default DiagnosticInfo;
