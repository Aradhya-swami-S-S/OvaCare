# 🌸 OvaCare - PCOS Healthcare Platform

A comprehensive healthcare platform for PCOS (Polycystic Ovary Syndrome) detection, management, and wellness support with AI-powered analysis, period tracking, diet management, and community support.

## ✨ Features

### 🔬 AI-Powered PCOS Detection
- **Ultrasound Image Analysis**: Upload ultrasound images for AI-powered PCOS detection using Groq Vision AI
- **Early Risk Prediction**: ML-based prediction using clinical and lifestyle data
- **Detailed Analysis Reports**: Get comprehensive findings and medical recommendations

### 📅 Period Tracker
- Track menstrual cycles with calendar view
- Predict next period dates based on cycle history
- Add notes and symptoms for each cycle
- View cycle statistics and patterns

### 🥗 Diet Tracker & Plans
- Log daily food intake with nutritional information
- Track calories, protein, carbs, and fats
- Pre-designed PCOS-friendly diet plans
- Daily nutritional goals and progress tracking

### 💬 Anonymous Community Chat
- Real-time anonymous chat with Socket.IO
- Connect with others in a safe, supportive environment
- Share experiences while maintaining complete privacy

### 🔐 Secure Authentication
- JWT-based authentication
- Protected routes and user data
- Secure password hashing with bcrypt

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.IO Client** for real-time chat
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express 5
- **MongoDB** with Mongoose
- **Socket.IO** for real-time features
- **JWT** for authentication
- **Multer** for file uploads
- **Groq SDK** for AI vision analysis
- **bcryptjs** for password hashing

### ML API
- **Python Flask** for REST API
- **scikit-learn** for ML models
- **pandas** & **numpy** for data processing
- **Random Forest Classifier** for PCOS prediction

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (local or Atlas)
- Groq API Key (for AI analysis)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Akarshhegde99/OvaCare.git
cd OvaCare
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "JWT_SECRET=your-secret-key-here" > .env
echo "GROQ_API_KEY=your-groq-api-key" >> .env

# Seed food database (optional)
npm run seed

# Start backend server
npm start
# or for development with auto-reload
npm run dev
```

Backend runs on `http://localhost:3000`

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start frontend development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. ML API Setup
```bash
cd pcos-ml-api

# Install Python dependencies
pip install -r requirements.txt

# Train the ML model
python train_model.py

# Start Flask API
python app.py
```

ML API runs on `http://localhost:5001`

### 5. MongoDB Setup
- Install MongoDB locally or use MongoDB Atlas
- Default connection: `mongodb://127.0.0.1:27017/crowd-delivery`
- Update connection string in `backend/app.js` if needed

## 🔑 Environment Variables

### Backend (.env)
```env
JWT_SECRET=your-secret-key-change-in-production
GROQ_API_KEY=your-groq-api-key-here
```

## 📁 Project Structure

```
OvaCare/
├── backend/              # Node.js/Express backend
│   ├── models/          # MongoDB models
│   ├── app.js           # Main server file
│   └── package.json
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── utils/       # Utility functions
│   └── package.json
├── pcos-ml-api/         # Python ML API
│   ├── model/           # Trained ML models
│   ├── dataset/         # Training data
│   ├── app.py           # Flask API
│   ├── train_model.py   # Model training script
│   └── requirements.txt
└── README.md
```

## 🎯 Usage

1. **Register/Login**: Create an account or login to access features
2. **PCOS Detection**: Upload ultrasound images or fill the prediction form
3. **Track Period**: Start tracking your menstrual cycle
4. **Log Diet**: Add food items and track daily nutrition
5. **Join Community**: Connect with others in anonymous chat

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected API routes
- Anonymous chat (no personal data exposed)
- Secure file upload validation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Akarsh Hegde - [@Akarshhegde99](https://github.com/Akarshhegde99)

## 🙏 Acknowledgments

- Groq AI for vision analysis capabilities
- MongoDB for database solutions
- React and Node.js communities

## 📞 Support

For support, please open an issue in the GitHub repository.

---

Made with ❤️ for women's health awareness



