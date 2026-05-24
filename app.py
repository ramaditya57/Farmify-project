from flask import Flask, request, jsonify, render_template
import pickle
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import StandardScaler, LabelEncoder
from tensorflow.keras.preprocessing import image
import pandas as pd
import json
import os
import uuid
import requests
import gdown
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# --- Base URLs from environment ---
is_render = os.environ.get('RENDER') == 'true'
default_chatbot_url = 'https://farmify-chatbot.onrender.com' if is_render else 'http://localhost:10000'
default_crop_url = 'https://farmify-project.onrender.com' if is_render else 'http://localhost:5000'

CHATBOT_URL = os.environ.get('CHATBOT_URL', default_chatbot_url).rstrip('/')
CROP_PROJECT_URL = os.environ.get('CROP_PROJECT_URL', default_crop_url).rstrip('/')

# Create upload folder for image predictions
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

import os
import requests

model_filename = 'random_forest_model.pkl'
model_url = 'https://drive.google.com/uc?export=download&id=1UbaCOLHOPts1jexD94X63ct0MlDb5Gqh'

# Download the model file if it doesn't exist
if not os.path.exists(model_filename):
    print("Downloading model from Google Drive...")
    response = requests.get(model_url)
    if response.status_code == 200:
        with open(model_filename, 'wb') as f:
            f.write(response.content)
        print("Model downloaded successfully.")
    else:
        print("Failed to download model. Status code:", response.status_code)


h5_model_filename = 'model.h5'
h5_model_url = 'https://drive.google.com/uc?id=1pnrWK0cIapAb-E16FSM4gp4lkH-aC7vO'

# Download the .h5 model file if it doesn't exist
if not os.path.exists(h5_model_filename):
    print("Downloading Keras model from Google Drive...")
    gdown.download(h5_model_url, h5_model_filename, quiet=False)
    print("Keras model downloaded successfully.")


# ==================== Crop Recommendation Setup ====================
dataset = pd.read_csv('Crop_recommendation.csv')
X = dataset.iloc[:, :-1].values
y = dataset.iloc[:, -1].values

label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

from sklearn.model_selection import train_test_split
X_train, X_test, Y_train, Y_test = train_test_split(X, y, test_size=0.2, random_state=0)

sc = StandardScaler()
X_train = sc.fit_transform(X_train)
X_test = sc.transform(X_test)

with open('random_forest_model.pkl', 'rb') as model_file:
    crop_classifier = pickle.load(model_file)

# ==================== Disease Model Setup ====================
disease_model = tf.keras.models.load_model("model.h5")
with open("labels.json", "r") as f:
    disease_class_labels = json.load(f)

def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(128, 128))
    img_array = image.img_to_array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

# ==================== Configuration & Proxy APIs ====================
@app.route('/api/firebase-config', methods=['GET'])
def get_firebase_config():
    return jsonify({
        'apiKey': os.environ.get('FIREBASE_API_KEY', ''),
        'authDomain': os.environ.get('FIREBASE_AUTH_DOMAIN', ''),
        'projectId': os.environ.get('FIREBASE_PROJECT_ID', ''),
        'storageBucket': os.environ.get('FIREBASE_STORAGE_BUCKET', ''),
        'messagingSenderId': os.environ.get('FIREBASE_MESSAGING_SENDER_ID', ''),
        'appId': os.environ.get('FIREBASE_APP_ID', ''),
        'measurementId': os.environ.get('FIREBASE_MEASUREMENT_ID', ''),
        'cropProjectUrl': CROP_PROJECT_URL,
        'chatbotUrl': CHATBOT_URL
    })

@app.route('/api/emailjs-config', methods=['GET'])
def get_emailjs_config():
    return jsonify({
        'publicKey': os.environ.get('EMAILJS_PUBLIC_KEY', ''),
        'serviceId': os.environ.get('EMAILJS_SERVICE_ID', ''),
        'templateId': os.environ.get('EMAILJS_TEMPLATE_ID', '')
    })

@app.route('/api/weather', methods=['GET'])
def get_weather():
    location = request.args.get('location', '').strip()
    if not location:
        return jsonify({'error': 'Location is required'}), 400
    
    api_key = os.environ.get('OPENWEATHER_API_KEY')
    if not api_key:
        return jsonify({'error': 'OpenWeatherMap API key not configured'}), 500
        
    api_url = "https://api.openweathermap.org/data/2.5/weather"
    try:
        response = requests.get(api_url, params={
            'q': location,
            'appid': api_key,
            'units': 'metric'
        })
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': 'Failed to fetch weather data'}), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== Web Routes ====================
@app.route('/')
def login():
    return render_template('login.html', show_loader=True, chatbot_url=CHATBOT_URL, crop_project_url=CROP_PROJECT_URL)

@app.route('/cron', methods=['GET'])
def cron():
    print("Cron ping received")
    return jsonify({"status": "alive ✅"})

@app.route('/signup')
def signup():
    return render_template('signup.html', show_loader=True, chatbot_url=CHATBOT_URL, crop_project_url=CROP_PROJECT_URL)

@app.route('/mainsec')
def mainsec():
    return render_template('mainpage.html', show_loader=True, chatbot_url=CHATBOT_URL, crop_project_url=CROP_PROJECT_URL)

@app.route('/home')
def home():
    return render_template('home.html', show_loader=True, chatbot_url=CHATBOT_URL, crop_project_url=CROP_PROJECT_URL)

@app.route('/team')
def team():
    return render_template('team.html', show_loader=True, chatbot_url=CHATBOT_URL, crop_project_url=CROP_PROJECT_URL)

@app.route('/contact')
def contact():
    return render_template('contact.html', show_loader=True, chatbot_url=CHATBOT_URL, crop_project_url=CROP_PROJECT_URL)

@app.route('/dis_pred')
def dis_pred():
    return render_template('dis_pred.html', show_loader=True, chatbot_url=CHATBOT_URL, crop_project_url=CROP_PROJECT_URL)

# ==================== Crop Recommendation Endpoint ====================
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = [float(request.form[k]) for k in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
        input_scaled = sc.transform([data])
        pred_encoded = crop_classifier.predict(input_scaled)
        label = label_encoder.inverse_transform(pred_encoded)
        return render_template('result.html', prediction=label[0], chatbot_url=CHATBOT_URL, crop_project_url=CROP_PROJECT_URL)
    except Exception as e:
        return render_template('result.html', error=str(e), chatbot_url=CHATBOT_URL, crop_project_url=CROP_PROJECT_URL)

# ==================== Disease Prediction Endpoint ====================
@app.route('/dis_predict', methods=['POST'])
def dis_predict():
    file = request.files.get('file')
    if not file or file.filename == '':
        return jsonify({'error': 'No file uploaded'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        img_array = preprocess_image(filepath)
        predictions = disease_model.predict(img_array)
        pred_index = str(np.argmax(predictions, axis=1)[0])
        label = disease_class_labels.get(pred_index, "Unknown")
        return jsonify({'prediction': label})
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

# ==================== Chatbot ====================

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html', show_loader=True, chatbot_url=CHATBOT_URL, crop_project_url=CROP_PROJECT_URL)

@app.route('/api/chat', methods=['POST'])
def chat_proxy():
    """
    Proxy requests to the existing chatbot service
    """
    try:
        # Get the request data
        data = request.json
        question = data.get('message', '')
        session_id = data.get('session_id', str(uuid.uuid4()))
        
        # Forward the request to your existing chatbot service
        response = requests.post(
            f'{CHATBOT_URL}/ask',
            json={'question': question, 'session_id': session_id},
            headers={'Content-Type': 'application/json'}
        )
        
        # Return the response from the chatbot service
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/new_chat', methods=['POST'])
def new_chat_proxy():
    """
    Proxy new chat requests to the chatbot service
    """
    try:
        response = requests.post(
            f'{CHATBOT_URL}/new_chat',
            json=request.json,
            headers={'Content-Type': 'application/json'}
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_history', methods=['POST'])
def get_history_proxy():
    """
    Proxy history requests to the chatbot service
    """
    try:
        response = requests.post(
            f'{CHATBOT_URL}/get_history',
            json=request.json,
            headers={'Content-Type': 'application/json'}
        )
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== Run App ====================
if __name__ == '__main__':
    # app.run(debug=True, port=5003)
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
