# Crop Coverage Analysis System

A full-stack application for comparing seasonal crop coverage using satellite imagery and vegetation indices.

![App Screenshot](/TriCAD-Assignment-SS.png)
![App Screenshot](/TriCAD-Assignment-SS2.png)
## Features ✨

- **Interactive Map Selection**
  - Click anywhere on the map to analyze a 10-acre area
  - Visual boundary polygon display
- **Multi-Season Comparison**
  - Compare summer vs winter crop coverage
  - Dynamic date selection
- **Advanced Analysis**
  - NDVI + EVI vegetation indices
  - ESA WorldCover cropland filtering
  - Adaptive thresholding
- **Visual Results**
  - Acreage statistics (cropped/idle land)

## Technical Stack 🛠️

| Component | Technology |
|-----------|------------|
| **Frontend** | React.js + Vite, Google Maps API |
| **Backend** | Python Flask, Earth Engine API |
| **Remote Sensing** | Sentinel-2, ESA WorldCover |
| **Vegetation Indices** | NDVI, EVI |
| **Deployment** | Localhost (Dev) |

## Setup Instructions ⚙️

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google Earth Engine account
- Google Cloud Project

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/yashwanth-smarty/Crop-Coverage-Analyzer.git
   cd crop-coverage-analyzer
   ```
2. **Backend Setup**
    ```bash
    # Install Python dependencies
    pip install flask flask-cors earthengine-api google-api-python-client requests
    # Authenticate Earth Engine
    earthengine authenticate
    ```
3. **Frontend Setup**
    ```bash
    cd frontend
    npm install
    ```
### Running the Application 🚀
1. **Start Backend (in root directory)**
    ```bash
    python server.py
    ```
2. **Start Frontend (in another terminal)**
    ```bash
    cd frontend
    npm run dev
    ```
3. **Access Application**
    ```bash
    http://localhost:3000
    ```
## User Guide 📖

### Step-by-Step Usage

1. **Select Location**
   - Click on the map to drop a pin
   - The blue marker shows your selection

2. **Choose Dates**
   - Set summer date (e.g., June 1)
   - Set winter date (e.g., Dec 1)

3. **Analyze**
   - Click "Analyze" button
   - Wait for processing (typically 2-5 seconds)

4. **Interpret Results**
   - View crop vs idle acreage

### Troubleshooting

|     Issue     |            Solution            |
|---------------|--------------------------------|
| Blank map     | Verify Google Maps API key     |
| No results    | Try different dates/locations  |
| Image errors  | Check backend console logs     |
| EE errors     | Run `earthengine authenticate` |
