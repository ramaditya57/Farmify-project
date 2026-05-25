#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Download model files during build so they are ready at startup and don't timeout
python -c "
import os
import requests
import gdown

model_filename = 'random_forest_model.pkl'
model_url = 'https://drive.google.com/uc?export=download&id=1UbaCOLHOPts1jexD94X63ct0MlDb5Gqh'
if not os.path.exists(model_filename):
    print('Downloading model from Google Drive...')
    response = requests.get(model_url)
    if response.status_code == 200:
        with open(model_filename, 'wb') as f:
            f.write(response.content)
        print('Model downloaded successfully.')
    else:
        print('Failed to download model. Status code:', response.status_code)

h5_model_filename = 'model.h5'
h5_model_url = 'https://drive.google.com/uc?id=1pnrWK0cIapAb-E16FSM4gp4lkH-aC7vO'
if not os.path.exists(h5_model_filename):
    print('Downloading Keras model from Google Drive...')
    gdown.download(h5_model_url, h5_model_filename, quiet=False)
    print('Keras model downloaded successfully.')
"
