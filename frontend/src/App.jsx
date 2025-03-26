import { useState } from 'react'
import { GoogleMap, LoadScript, Marker, Polygon } from '@react-google-maps/api'
import axios from 'axios'

function App() {
  const [position, setPosition] = useState(null)
  const [summerDate, setSummerDate] = useState('2023-06-01')
  const [winterDate, setWinterDate] = useState('2023-12-01')
  const [results, setResults] = useState(null)
  const [boundary, setBoundary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleMapClick = (e) => {
    setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    setResults(null)
    setError(null)
  }

  const analyzeCrops = async () => {
    if (!position) return
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/analyze`,
        {
          position,
          summerDate,
          winterDate
        },
        {
          timeout: 30000 // 30 seconds timeout
        }
      )
      
      if (!response.data?.boundary) {
        throw new Error('Invalid response format from server')
      }
      
      setResults(response.data)
      setBoundary(response.data.boundary[0].map(([lng, lat]) => ({ lat, lng })))
    } catch (error) {
      console.error('Analysis error:', error)
      setError(error.response?.data?.error || 
               error.message || 
               'Failed to analyze crop coverage. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Crop Coverage Analyzer (10 Acres)</h1>
      
      {error && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '4px',
          color: '#d32f2f'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div>
          <label>Summer Date: </label>
          <input 
            type="date" 
            value={summerDate}
            onChange={(e) => setSummerDate(e.target.value)}
            style={{ padding: '5px' }}
            disabled={loading}
          />
        </div>
        <div>
          <label>Winter Date: </label>
          <input 
            type="date" 
            value={winterDate}
            onChange={(e) => setWinterDate(e.target.value)}
            style={{ padding: '5px' }}
            disabled={loading}
          />
        </div>
        <button 
          onClick={analyzeCrops}
          disabled={!position || loading}
          style={{ 
            padding: '5px 15px',
            background: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (position && !loading) ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? (
            <>
              <span style={{ marginRight: '8px' }}>⏳</span>
              Processing...
            </>
          ) : 'Analyze'}
        </button>
      </div>

      <div style={{ 
        height: '60vh', 
        width: '100%',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <LoadScript 
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          loadingElement={<div style={{ height: '100%' }}>Loading map...</div>}
        >
          <GoogleMap
            center={position || { lat: 17.3850, lng: 78.4867 }}
            zoom={16}
            onClick={handleMapClick}
            mapContainerStyle={{ height: '100%', width: '100%' }}
            options={{
              disableDefaultUI: true,
              zoomControl: true
            }}
          >
            {position && <Marker position={position} />}
            {boundary && (
              <Polygon
                paths={boundary}
                options={{
                  fillColor: '#00FF00',
                  fillOpacity: 0.2,
                  strokeColor: '#FF0000',
                  strokeOpacity: 1,
                  strokeWeight: 2
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {results && (
        <div style={{ 
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          <div style={{ 
            border: '1px solid #4CAF50',
            padding: '15px',
            borderRadius: '8px',
            background: '#f8fff8'
          }}>
            <h3 style={{ color: '#4CAF50', marginTop: 0 }}>Summer ({summerDate})</h3>
            <p>🌱 <strong>Crop Area:</strong> {results.summer.acresWithCrop} acres</p>
            <p>🟫 <strong>Idle Land:</strong> {results.summer.acresIdle} acres</p>
          </div>
          <div style={{ 
            border: '1px solid #2196F3',
            padding: '15px',
            borderRadius: '8px',
            background: '#f8faff'
          }}>
            <h3 style={{ color: '#2196F3', marginTop: 0 }}>Winter ({winterDate})</h3>
            <p>🌱 <strong>Crop Area:</strong> {results.winter.acresWithCrop} acres</p>
            <p>🟫 <strong>Idle Land:</strong> {results.winter.acresIdle} acres</p>
          </div>
        </div>
      )}

      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          color: 'white'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            color: '#333',
            textAlign: 'center'
          }}>
            <p>Processing satellite data...</p>
            <p>This may take 20-30 seconds</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App