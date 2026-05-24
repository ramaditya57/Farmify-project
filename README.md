### Project Overview
Farmify addresses the core challenges of modern agriculture-inefficient crop selection, soil degradation, and crop losses due to disease-by combining advanced machine learning and deep learning techniques in a user-friendly web platform. It enables farmers to make data-driven decisions tailored to their unique soil and environmental conditions, resulting in increased productivity and sustainability.

### How Farmify Works
## 1. Crop Recommendation System:
User Input: Farmers enter key soil parameters (Nitrogen, Phosphorus, Potassium, pH), along with climate data (temperature, humidity, rainfall).
Data Preprocessing: The system normalizes and scales input data, handling missing values and encoding categorical variables to ensure robust model performance.
Machine Learning Prediction: A Random Forest Classifier, trained on a dataset of 2,200+ diverse agricultural samples, analyzes the input to recommend the most suitable crop for the given conditions. The model achieves up to 98% training and 95% testing accuracy.
Output: The recommended crop and its probability of success are displayed, enabling informed decision-making for optimal yield and resource use.

## 2. Plant Disease Detection:

Image Upload: Farmers can upload images of crops or leaves showing potential disease symptoms.
Deep Learning Analysis: A Convolutional Neural Network (CNN) processes the images to detect and classify plant diseases. The CNN is trained on thousands of labeled images, achieving 95% training and 90% testing accuracy.
Results: The system identifies the disease (if present) and provides actionable treatment suggestions, helping farmers intervene early and minimize crop loss.

## 3. AI Chatbot Integration:

Natural Language Support: An AI-powered chatbot, built using Retrieval-Augmented Generation (RAG) and integrated with the HuggingFace API, answers agricultural queries in plain language.
Image-Based Q&A: The chatbot can also analyze uploaded images using YOLOv8 for instant disease detection and advice.
Contextual Assistance: The chatbot retrieves information from scientific sources to provide accurate, context-aware responses.

### Special Features
1. Dual Functionality: Combines crop recommendation and disease detection in one seamless platform.
2. Region-Specific & Real-Time: Offers dynamic, localized recommendations by adapting to user-supplied and real-time weather data.
3. User-Friendly Web Interface: Clean, intuitive forms for data entry and image upload; results are easy to interpret for users with any level of digital literacy.
4. Continuous Model Improvement: Incorporates user feedback and new data for ongoing refinement and accuracy.
5. Mobile and IoT Ready: Designed for future expansion to mobile apps and IoT sensor integration for automated, real-time data collection.
6. Data Security: Ensures privacy and secure handling of all user data.

### Technologies Used
1. Machine Learning: Random Forest Classifier for crop recommendation.
2. Deep Learning: Convolutional Neural Networks (CNNs) for plant disease detection.
3. Natural Language Processing: RAG-based chatbot with HuggingFace API for Q&A.
4. Object Detection: YOLOv8 for image-based disease identification.
5. Python Libraries: pandas, scikit-learn, TensorFlow, Keras, NumPy.
6. Web Framework: Flask for backend; HTML, CSS, JavaScript for frontend.
7. Data Augmentation: TensorFlow’s ImageDataGenerator for robust CNN training.
8. API Integration: For real-time weather data and external agricultural resources.
9. Security: Environment variable management for API keys and secure logging.
