import { useState } from 'react'
import { GoogleMap, LoadScript, Marker, Polygon } from '@react-google-maps/api'
import axios from 'axios'

const API_KEY = "AIzaSyC8YfAPe9b8epIlmF0CTRxetO2-GIGae3o"

function App() {
  const [position, setPosition] = useState(null)
  const [summerDate, setSummerDate] = useState('2023-06-01')
  const [winterDate, setWinterDate] = useState('2023-12-01')
  const [results, setResults] = useState(null)
  const [boundary, setBoundary] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleMapClick = (e) => {
    setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    setResults(null)
  }

  const analyzeCrops = async () => {
    if (!position) return
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/analyze', {
        position,
        summerDate,
        winterDate
      })
      setResults(response.data)
      setBoundary(response.data.boundary[0].map(([lng, lat]) => ({ lat, lng })))
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Crop Coverage Analyzer (10 Acres)</h1>
      
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
          />
        </div>
        <div>
          <label>Winter Date: </label>
          <input 
            type="date" 
            value={winterDate}
            onChange={(e) => setWinterDate(e.target.value)}
            style={{ padding: '5px' }}
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
            borderRadius: '4px'
          }}
        >
          {loading ? 'Processing...' : 'Analyze'}
        </button>
      </div>

      <div style={{ 
        height: '60vh', 
        width: '100%',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <LoadScript googleMapsApiKey={API_KEY}>
          <GoogleMap
            center={position || { lat: 17.3850, lng: 78.4867 }}
            zoom={16}
            onClick={handleMapClick}
            mapContainerStyle={{ height: '100%', width: '100%' }}
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
    </div>
  )
}

export default App