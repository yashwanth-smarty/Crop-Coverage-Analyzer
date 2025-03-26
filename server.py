from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import ee
import os
import requests
from datetime import datetime

app = Flask(__name__, static_folder='../frontend/dist')
CORS(app)

# Initialize Earth Engine
ee.Initialize(project='steel-bliss-454606-j7') #replace it with your project-id

def get_crop_stats(boundary, date):
    s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
        .filterBounds(boundary) \
        .filterDate(date, ee.Date(date).advance(1, 'month')) \
        .median()
    
    ndvi = s2.normalizedDifference(['B8', 'B4'])
    evi = s2.expression(
        '2.5 * ((B8 - B4) / (B8 + 6 * B4 - 7.5 * B2 + 1))',
        {
            'B8': s2.select('B8'),
            'B4': s2.select('B4'),
            'B2': s2.select('B2')
        }
    )
    
    cropland_mask = ee.Image('ESA/WorldCover/v100').select('Map').eq(40)
    
    ndvi_threshold = 0.35 if evi.reduceRegion(ee.Reducer.mean(), boundary, 30).getInfo()['constant'] > 0.2 else 0.4
    cropland = ndvi.gt(ndvi_threshold).And(cropland_mask)
    
    stats = cropland.multiply(ee.Image.pixelArea()).divide(4047).reduceRegion(
        reducer=ee.Reducer.sum(),
        geometry=boundary,
        scale=10
    ).getInfo()
    
    return round(stats.get('constant', 0), 2)

def get_thumbnail(boundary, date):
    try:
        img = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
            .filterBounds(boundary) \
            .filterDate(date, ee.Date(date).advance(1, 'month')) \
            .median() \
            .visualize(min=0, max=3000, bands=['B4', 'B3', 'B2'])
        
        url = img.getThumbURL({
            'dimensions': 512,
            'region': boundary,
            'format': 'png'
        })
        
        response = requests.get(url, stream=True)
        return Response(response.content, mimetype='image/png')
    except Exception as e:
        print(f"Thumbnail error: {str(e)}")
        return None

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        lat, lng = data['position']['lat'], data['position']['lng']
        point = ee.Geometry.Point([lng, lat])
        boundary = point.buffer(140).bounds()
        
        summer = get_crop_stats(boundary, data['summerDate'])
        winter = get_crop_stats(boundary, data['winterDate'])
        
        return jsonify({
            'summer': { 
                'acresWithCrop': min(summer, 10), 
                'acresIdle': 10 - min(summer, 10)
            },
            'winter': { 
                'acresWithCrop': min(winter, 10), 
                'acresIdle': 10 - min(winter, 10)
            },
            'boundary': boundary.getInfo()['coordinates'],
            'position': {'lat': lat, 'lng': lng},
            'dates': {
                'summer': data['summerDate'],
                'winter': data['winterDate']
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/thumbnail/<season>', methods=['POST'])
def thumbnail(season):
    try:
        data = request.json
        point = ee.Geometry.Point([data['position']['lng'], data['position']['lat']])
        boundary = point.buffer(140).bounds()
        
        date = data['dates'][season]
        return get_thumbnail(boundary, date) or Response(status=404)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(port=5000)
