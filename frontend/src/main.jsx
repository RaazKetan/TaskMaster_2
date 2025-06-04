import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

function App() {
  console.log('TaskMaster App rendering...');
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '24px',
          color: '#1f2937'
        }}>
          TaskMaster
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '16px'
        }}>
          Project Management Tool
        </p>
        
        <div style={{ marginBottom: '16px' }}>
          <button 
            onClick={() => alert('Login clicked!')}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '8px',
              fontSize: '16px'
            }}
          >
            Login
          </button>
          
          <button 
            onClick={() => alert('Register clicked!')}
            style={{
              width: '100%',
              backgroundColor: '#16a34a',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Register
          </button>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            API Status: Connected ✓
          </p>
        </div>
      </div>
    </div>
  );
}

console.log('TaskMaster main.jsx loading...')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
