require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const axios = require('axios');
const Groq = require('groq-sdk');
const { createServer } = require('http');
const { Server } = require('socket.io');
const User = require('./models/Users');
const Message = require('./models/Message');
const Period = require('./models/Period');
const PeriodNote = require('./models/PeriodNote');
const FoodItem = require('./models/FoodItem');
const FoodLog = require('./models/FoodLog');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? [process.env.FRONTEND_URL || "https://ovacare-frontend.onrender.com"]
            : ["http://localhost:5173", "http://localhost:5174"], // Frontend URLs
        methods: ["GET", "POST"]
    }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Groq client removed - using local ML models only
// If you want to use Groq as an additional option, uncomment below:
// const groq = new Groq({
//     apiKey: process.env.GROQ_API_KEY
// });

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/crowd-delivery";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log('Database:', MONGODB_URI.includes('mongodb.net') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Socket.IO Authentication Middleware
const authenticateSocket = (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        return next(new Error('Authentication error'));
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error'));
        }
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        next();
    });
};

// Socket.IO Connection Handling
io.use(authenticateSocket);

const connectedUsers = new Map(); // Track connected users (for internal use only)

// Utility function to anonymize messages with user identification for styling
const anonymizeMessage = (message, currentUserId = null) => ({
    _id: message._id,
    content: message.content,
    username: 'Anonymous', // Always anonymous
    timestamp: message.timestamp,
    isAnonymous: true,
    isOwnMessage: currentUserId ? message.userId.toString() === currentUserId.toString() : false
    // userId and real username excluded from client response
});

io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userEmail}`);
    
    // Get user info
    try {
        const user = await User.findById(socket.userId).select('name email');
        socket.userName = user.name;
        connectedUsers.set(socket.userId, {
            socketId: socket.id,
            name: user.name,
            email: user.email
        });
        
        // Send recent messages to newly connected user (anonymized)
        const recentMessages = await Message.find({ isDeleted: false })
            .sort({ timestamp: -1 })
            .limit(50)
            .select('content timestamp userId');
            
        // Anonymize all messages before sending with user identification for styling
        const anonymizedMessages = recentMessages.map(msg => anonymizeMessage(msg, socket.userId));
            
        socket.emit('recent_messages', anonymizedMessages.reverse());
        
        // Note: User count not broadcasted for complete anonymity
        
    } catch (error) {
        console.error('Error fetching user info:', error);
    }

    // Handle new message
    socket.on('send_message', async (data) => {
        try {
            const { content } = data;
            
            // Validate message
            if (!content || content.trim().length === 0) {
                socket.emit('error', { message: 'Message cannot be empty' });
                return;
            }
            
            if (content.length > 500) {
                socket.emit('error', { message: 'Message too long (max 500 characters)' });
                return;
            }
            
            // Create message
            const message = new Message({
                content: content.trim(),
                userId: socket.userId,
                username: socket.userName,
                isAnonymous: true // Always anonymous for community chat
            });
            
            await message.save();
            
            // Broadcast message to all connected users (anonymized)
            // Send to all users with their own user ID for styling
            connectedUsers.forEach((userInfo, userId) => {
                const messageData = anonymizeMessage(message, userId);
                io.to(userInfo.socketId).emit('new_message', messageData);
            });
            
            // Also broadcast to all sockets as a fallback to ensure delivery
            const fallbackMessage = anonymizeMessage(message, null);
            io.emit('new_message', fallbackMessage);
            
            console.log(`Message broadcasted to ${connectedUsers.size} connected users`);
            
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Handle typing indicator (completely anonymous)
    socket.on('typing', (data) => {
        socket.broadcast.emit('user_typing', {
            username: 'Someone', // Always anonymous
            isTyping: data.isTyping
        });
    });

    // Handle ping for connection health check
    socket.on('ping', () => {
        socket.emit('pong');
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userEmail}`);
        connectedUsers.delete(socket.userId);
        // Note: User count not broadcasted for complete anonymity
    });
});

// REGISTER
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// LOGIN
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Protected route example
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Debug endpoint to check available models
app.get('/debug/models', authenticateToken, async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'Groq API key not configured' });
        }

        const modelStatus = [];
        
        // Test basic text model first
        try {
            await groq.chat.completions.create({
                messages: [{ role: "user", content: "Hello" }],
                model: "llama-3.1-70b-versatile",
                max_tokens: 5
            });
            modelStatus.push({ model: "llama-3.1-70b-versatile", status: 'available', type: 'text' });
        } catch (error) {
            modelStatus.push({ 
                model: "llama-3.1-70b-versatile", 
                status: 'unavailable', 
                type: 'text',
                error: error.message 
            });
        }
        
        // Test vision models
        for (const model of VISION_MODELS) {
            try {
                await groq.chat.completions.create({
                    messages: [{ role: "user", content: "Test" }],
                    model: model,
                    max_tokens: 1
                });
                modelStatus.push({ model, status: 'available', type: 'vision' });
            } catch (error) {
                modelStatus.push({ 
                    model, 
                    status: 'unavailable', 
                    type: 'vision',
                    error: error.message 
                });
            }
        }

        res.json({
            availableModels: modelStatus,
            textModelAvailable: modelStatus.find(m => m.model === 'llama-3.1-70b-versatile' && m.status === 'available') ? true : false,
            visionModelAvailable: modelStatus.find(m => m.type === 'vision' && m.status === 'available')?.model || 'none',
            apiKeyConfigured: !!process.env.GROQ_API_KEY
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check models' });
    }
});

// Simple test endpoint
app.get('/test-groq', authenticateToken, async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'Groq API key not configured' });
        }

        const response = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say hello" }],
            model: "llama-3.1-70b-versatile",
            max_tokens: 10
        });

        res.json({
            success: true,
            response: response.choices[0].message.content,
            model: "llama-3.1-70b-versatile"
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Groq test failed',
            details: error.message 
        });
    }
});

// CHAT API ENDPOINTS

// Get recent messages
app.get('/api/chat/messages', authenticateToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ isDeleted: false })
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip)
            .select('content timestamp isAnonymous userId');

        // Always return anonymous messages for community chat with user identification for styling
        const anonymousMessages = messages.map(msg => anonymizeMessage(msg, req.user.userId));

        res.json({
            messages: anonymousMessages.reverse(),
            hasMore: messages.length === limit
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Test endpoint to verify real-time messaging
app.post('/api/chat/test', authenticateToken, async (req, res) => {
    try {
        const testMessage = new Message({
            content: 'Test message - real-time chat is working!',
            userId: req.userId,
            username: 'System Test',
            isAnonymous: true
        });
        
        await testMessage.save();
        
        // Broadcast test message to all connected users
        connectedUsers.forEach((userInfo, userId) => {
            const messageData = anonymizeMessage(testMessage, userId);
            io.to(userInfo.socketId).emit('new_message', messageData);
        });
        
        // Also broadcast to all sockets as a fallback
        const fallbackMessage = anonymizeMessage(testMessage, null);
        io.emit('new_message', fallbackMessage);
        
        res.json({ success: true, message: 'Test message sent' });
    } catch (error) {
        console.error('Error sending test message:', error);
        res.status(500).json({ error: 'Failed to send test message' });
    }
});

// Send message via REST API (alternative to Socket.IO)
app.post('/api/chat/send', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        
        // Validate message
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }
        
        if (content.length > 500) {
            return res.status(400).json({ error: 'Message too long (max 500 characters)' });
        }
        
        const user = await User.findById(req.user.userId).select('name');
        
        // Create message
        const message = new Message({
            content: content.trim(),
            userId: req.user.userId,
            username: user.name,
            isAnonymous: true
        });
        
        await message.save();
        
        // Broadcast via Socket.IO if available (anonymized)
        // Send to all users with their own user ID for styling
        connectedUsers.forEach((userInfo, userId) => {
            const messageData = anonymizeMessage(message, userId);
            io.to(userInfo.socketId).emit('new_message', messageData);
        });
        
        res.json({
            success: true,
            message: messageData
        });
        
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get online users count (for internal use only - not exposed to maintain anonymity)
app.get('/api/chat/users-online', authenticateToken, (req, res) => {
    res.json({
        count: 0, // Always return 0 for complete anonymity
        users: [] // No user information exposed
    });
});

// Available vision models (in order of preference) - Updated for current Groq models
// Groq Vision Models - DISABLED (using local ML models instead)
// Uncomment if you want to add Groq as an additional option
/*
const VISION_MODELS = [
    "llama-3.2-90b-vision-preview",
    "llama-3.2-11b-vision-preview",
    "llava-v1.5-7b-4096-preview",
    "llama-3.2-1b-preview"
];

let cachedWorkingModel = null;
let lastModelCheck = 0;
const MODEL_CACHE_DURATION = 5 * 60 * 1000;

async function getWorkingVisionModel() {
    if (cachedWorkingModel && (Date.now() - lastModelCheck) < MODEL_CACHE_DURATION) {
        return cachedWorkingModel;
    }

    for (const model of VISION_MODELS) {
        try {
            const testResponse = await groq.chat.completions.create({
                messages: [{
                    role: "user",
                    content: [
                        { type: "text", text: "What do you see in this image?" },
                        { type: "image_url", image_url: { url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" } }
                    ]
                }],
                model: model,
                max_tokens: 10
            });
            
            cachedWorkingModel = model;
            lastModelCheck = Date.now();
            console.log(`Successfully using vision model: ${model}`);
            return model;
        } catch (error) {
            console.log(`Model ${model} not available:`, error.message);
            continue;
        }
    }
    
    cachedWorkingModel = null;
    throw new Error('No vision models available');
}
*/

// LOCAL ML PCOS ANALYSIS (No Groq dependency)
app.post('/analyze-ultrasound', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        console.log('Analyzing ultrasound image using local ML models...');

        // Convert image to base64
        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        // Use local ML API directly (no Groq dependency)
        try {
            const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';
            const localAnalysisResponse = await axios.post(`${ML_API_URL}/analyze-image`, {
                image: `data:${mimeType};base64,${imageBase64}`
            }, {
                timeout: 30000 // 30 second timeout
            });

            if (localAnalysisResponse.data.success) {
                console.log('Local ML analysis successful');
                return res.json({
                    success: true,
                    isUltrasound: localAnalysisResponse.data.isUltrasound,
                    analysis: localAnalysisResponse.data.analysis,
                    metrics: localAnalysisResponse.data.metrics,
                    method: localAnalysisResponse.data.method || 'Local ML Model',
                    timestamp: new Date().toISOString()
                });
            } else {
                console.error('Local ML analysis failed:', localAnalysisResponse.data.error);
                return res.status(400).json({
                    error: localAnalysisResponse.data.error || 'Analysis failed',
                    details: localAnalysisResponse.data.details || 'Unknown error'
                });
            }
        } catch (localError) {
            console.error('Local ML API error:', localError.message);
            
            // Check if it's a connection error
            if (localError.code === 'ECONNREFUSED' || localError.code === 'ETIMEDOUT') {
                return res.status(503).json({
                    error: 'ML API not available',
                    details: 'Please ensure the ML API is running on port 5001. Start it with: cd pcos-ml-api && python app.py',
                    code: 'ML_API_OFFLINE'
                });
            }
            
            throw localError;
        }

    } catch (error) {
        console.error('Ultrasound Analysis Error:', error);

        res.status(500).json({
            error: 'Failed to analyze image',
            details: error.message || 'Unknown error occurred',
            help: 'Make sure the ML API is running: cd pcos-ml-api && python app.py'
        });
    }
});

// PREDICT (PCOS Risk)
app.post('/predict', async (req, res) => {
    try {
        const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';
        const response = await axios.post(`${ML_API_URL}/predict`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Prediction failed' });
    }
});

// AI DIET RECOMMENDATIONS
app.post('/api/diet/ai-recommendations', authenticateToken, async (req, res) => {
    try {
        const { pcosDetected, confidence, userPreferences } = req.body;
        
        // Generate AI-powered diet recommendations based on PCOS status
        const recommendations = generateDietRecommendations(pcosDetected, confidence, userPreferences);
        
        res.json({
            success: true,
            recommendations,
            pcosDetected,
            confidence,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Diet recommendation error:', error);
        res.status(500).json({ error: 'Failed to generate diet recommendations' });
    }
});

function generateDietRecommendations(pcosDetected, confidence, userPreferences = {}) {
    const baseRecommendations = {
        mealPlan: [],
        guidelines: [],
        foodsToInclude: [],
        foodsToAvoid: [],
        supplements: [],
        tips: []
    };

    if (pcosDetected) {
        // PCOS-specific recommendations
        baseRecommendations.mealPlan = [
            {
                meal: 'Breakfast',
                options: [
                    'Greek yogurt with berries and chia seeds',
                    'Vegetable omelet with spinach and mushrooms',
                    'Oatmeal with cinnamon and nuts',
                    'Avocado toast on whole grain bread'
                ],
                calories: '300-400',
                timing: '7:00-9:00 AM'
            },
            {
                meal: 'Mid-Morning Snack',
                options: [
                    'Handful of almonds',
                    'Apple with almond butter',
                    'Green tea with a small piece of dark chocolate'
                ],
                calories: '150-200',
                timing: '10:00-11:00 AM'
            },
            {
                meal: 'Lunch',
                options: [
                    'Quinoa salad with grilled chicken and vegetables',
                    'Lentil soup with mixed greens',
                    'Salmon with roasted vegetables',
                    'Chickpea curry with brown rice'
                ],
                calories: '400-500',
                timing: '12:00-2:00 PM'
            },
            {
                meal: 'Afternoon Snack',
                options: [
                    'Hummus with cucumber slices',
                    'Mixed nuts and seeds',
                    'Herbal tea with a small portion of cheese'
                ],
                calories: '150-200',
                timing: '3:00-4:00 PM'
            },
            {
                meal: 'Dinner',
                options: [
                    'Grilled fish with steamed broccoli and sweet potato',
                    'Turkey and vegetable stir-fry',
                    'Tofu curry with cauliflower rice',
                    'Lean beef with roasted vegetables'
                ],
                calories: '400-500',
                timing: '6:00-8:00 PM'
            }
        ];

        baseRecommendations.guidelines = [
            'Focus on low glycemic index foods to manage insulin resistance',
            'Eat regular, balanced meals to stabilize blood sugar',
            'Include anti-inflammatory foods like fatty fish, berries, and leafy greens',
            'Limit refined carbohydrates and processed foods',
            'Stay hydrated with 8-10 glasses of water daily',
            'Consider intermittent fasting under medical supervision'
        ];

        baseRecommendations.foodsToInclude = [
            'Leafy greens (spinach, kale, arugula)',
            'Fatty fish (salmon, mackerel, sardines)',
            'Nuts and seeds (almonds, walnuts, chia seeds)',
            'Berries (blueberries, strawberries, raspberries)',
            'Whole grains (quinoa, brown rice, oats)',
            'Lean proteins (chicken, turkey, tofu)',
            'Healthy fats (avocado, olive oil)',
            'Legumes (lentils, chickpeas, black beans)'
        ];

        baseRecommendations.foodsToAvoid = [
            'Refined sugars and high-sugar foods',
            'Processed and packaged foods',
            'White bread and refined grains',
            'Sugary drinks and sodas',
            'Trans fats and fried foods',
            'Excessive dairy products',
            'High-sodium foods',
            'Alcohol in excess'
        ];

        baseRecommendations.supplements = [
            'Inositol (2-4g daily) - may help with insulin sensitivity',
            'Omega-3 fatty acids - for anti-inflammatory effects',
            'Vitamin D - often deficient in PCOS',
            'Chromium - may help with glucose metabolism',
            'Spearmint tea - may help with hormonal balance'
        ];

        baseRecommendations.tips = [
            'Eat protein with every meal to stabilize blood sugar',
            'Choose complex carbohydrates over simple sugars',
            'Practice mindful eating and chew slowly',
            'Plan meals in advance to avoid impulsive food choices',
            'Consider working with a registered dietitian',
            'Monitor how different foods affect your energy and symptoms'
        ];
    } else {
        // General healthy diet recommendations
        baseRecommendations.mealPlan = [
            {
                meal: 'Breakfast',
                options: [
                    'Whole grain cereal with milk and fruit',
                    'Smoothie with spinach, banana, and protein powder',
                    'Whole grain toast with avocado and egg',
                    'Yogurt parfait with granola and berries'
                ],
                calories: '350-450',
                timing: '7:00-9:00 AM'
            },
            {
                meal: 'Lunch',
                options: [
                    'Mediterranean salad with grilled chicken',
                    'Vegetable soup with whole grain bread',
                    'Quinoa bowl with roasted vegetables',
                    'Turkey and hummus wrap'
                ],
                calories: '400-500',
                timing: '12:00-2:00 PM'
            },
            {
                meal: 'Dinner',
                options: [
                    'Baked salmon with quinoa and vegetables',
                    'Vegetable stir-fry with brown rice',
                    'Grilled chicken with sweet potato and greens',
                    'Lentil curry with whole grain naan'
                ],
                calories: '450-550',
                timing: '6:00-8:00 PM'
            }
        ];

        baseRecommendations.guidelines = [
            'Maintain a balanced diet with variety',
            'Include fruits and vegetables in every meal',
            'Choose whole grains over refined grains',
            'Stay hydrated throughout the day',
            'Practice portion control',
            'Limit processed and fast foods'
        ];

        baseRecommendations.foodsToInclude = [
            'Colorful fruits and vegetables',
            'Whole grains and fiber-rich foods',
            'Lean proteins from various sources',
            'Healthy fats like nuts and olive oil',
            'Low-fat dairy or alternatives',
            'Plenty of water and herbal teas'
        ];

        baseRecommendations.foodsToAvoid = [
            'Excessive processed foods',
            'High-sugar snacks and desserts',
            'Sugary beverages',
            'Excessive saturated fats',
            'Too much sodium',
            'Excessive alcohol consumption'
        ];

        baseRecommendations.tips = [
            'Eat a rainbow of fruits and vegetables',
            'Plan balanced meals with all food groups',
            'Listen to your hunger and fullness cues',
            'Stay active and maintain regular exercise',
            'Get adequate sleep for better metabolism',
            'Practice stress management techniques'
        ];
    }

    return baseRecommendations;
}

// SAVE DIET PLAN
app.post('/api/diet/save-plan', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { pcosDetected, recommendations, savedAt, planType } = req.body;
        
        // For now, we'll store it in a simple way
        // In a real app, you'd want a proper DietPlan model
        const dietPlan = {
            userId,
            pcosDetected,
            recommendations,
            planType,
            savedAt: savedAt || new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        // Store in user's session or a simple file for demo
        // In production, you'd save to database
        console.log('Diet plan saved for user:', userId, dietPlan);
        
        res.json({
            success: true,
            message: 'Diet plan saved successfully',
            planId: `plan_${userId}_${Date.now()}`,
            savedAt: dietPlan.savedAt
        });
        
    } catch (error) {
        console.error('Error saving diet plan:', error);
        res.status(500).json({ error: 'Failed to save diet plan' });
    }
});

// PERIOD TRACKER API ENDPOINTS

// Get user's period data
app.get('/api/period/cycles', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get current active cycle
        const currentCycle = await Period.findOne({ 
            userId, 
            isActive: true 
        }).sort({ startDate: -1 });

        // Get past cycles
        const pastCycles = await Period.find({ 
            userId, 
            isActive: false 
        }).sort({ startDate: -1 }).limit(12);

        // Calculate average cycle length
        const averageCycleLength = await Period.calculateAverageCycleLength(userId);

        // Calculate next predicted date
        let nextPredictedDate = null;
        if (currentCycle) {
            nextPredictedDate = currentCycle.predictedNextDate;
        }

        // Calculate current cycle day
        let currentCycleDay = null;
        if (currentCycle) {
            const today = new Date();
            const startDate = new Date(currentCycle.startDate);
            const diffTime = Math.abs(today - startDate);
            currentCycleDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }

        res.json({
            currentCycle,
            pastCycles,
            averageCycleLength,
            nextPredictedDate,
            currentCycleDay
        });

    } catch (error) {
        console.error('Error fetching period data:', error);
        res.status(500).json({ error: 'Failed to fetch period data' });
    }
});

// Start new period cycle
app.post('/api/period/start', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate } = req.body;

        // Validation
        if (!startDate) {
            return res.status(400).json({ error: 'Start date is required' });
        }

        const periodStartDate = new Date(startDate);
        const today = new Date();

        // Prevent future dates
        if (periodStartDate > today) {
            return res.status(400).json({ error: 'Start date cannot be in the future' });
        }

        // Check if there's an active cycle
        const activeCycle = await Period.findOne({ userId, isActive: true });

        if (activeCycle) {
            // Calculate cycle length for the previous cycle
            activeCycle.cycleLength = activeCycle.calculateCycleLength(periodStartDate);
            activeCycle.isActive = false;
            await activeCycle.save();
        }

        // Calculate average cycle length
        const averageCycleLength = await Period.calculateAverageCycleLength(userId);

        // Predict next period
        const predictedNextDate = Period.predictNextPeriod(periodStartDate, averageCycleLength);

        // Create new period
        const newPeriod = new Period({
            userId,
            startDate: periodStartDate,
            predictedNextDate,
            isActive: true
        });

        await newPeriod.save();

        res.status(201).json({
            message: 'Period logged successfully',
            period: newPeriod,
            averageCycleLength
        });

    } catch (error) {
        console.error('Error starting period:', error);
        res.status(500).json({ error: 'Failed to log period' });
    }
});

// End current period
app.post('/api/period/end', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { endDate } = req.body;

        if (!endDate) {
            return res.status(400).json({ error: 'End date is required' });
        }

        const periodEndDate = new Date(endDate);

        // Find active cycle
        const activeCycle = await Period.findOne({ userId, isActive: true });

        if (!activeCycle) {
            return res.status(404).json({ error: 'No active period found' });
        }

        // Validate end date is after start date
        if (periodEndDate < activeCycle.startDate) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        activeCycle.endDate = periodEndDate;
        await activeCycle.save();

        res.json({
            message: 'Period ended successfully',
            period: activeCycle
        });

    } catch (error) {
        console.error('Error ending period:', error);
        res.status(500).json({ error: 'Failed to end period' });
    }
});

// Update period
app.put('/api/period/update/:periodId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { periodId } = req.params;
        const { startDate, endDate } = req.body;

        const period = await Period.findOne({ _id: periodId, userId });

        if (!period) {
            return res.status(404).json({ error: 'Period not found' });
        }

        if (startDate) {
            period.startDate = new Date(startDate);
            
            // Recalculate predicted next date
            const averageCycleLength = await Period.calculateAverageCycleLength(userId);
            period.predictedNextDate = Period.predictNextPeriod(period.startDate, averageCycleLength);
        }

        if (endDate) {
            period.endDate = new Date(endDate);
        }

        await period.save();

        res.json({
            message: 'Period updated successfully',
            period
        });

    } catch (error) {
        console.error('Error updating period:', error);
        res.status(500).json({ error: 'Failed to update period' });
    }
});

// Reset tracker (delete all data)
app.delete('/api/period/reset', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Delete all periods
        await Period.deleteMany({ userId });

        // Delete all notes
        await PeriodNote.deleteMany({ userId });

        res.json({
            message: 'Period tracker reset successfully'
        });

    } catch (error) {
        console.error('Error resetting tracker:', error);
        res.status(500).json({ error: 'Failed to reset tracker' });
    }
});

// Get notes for a period
app.get('/api/period/notes/:periodId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { periodId } = req.params;

        // Verify period belongs to user
        const period = await Period.findOne({ _id: periodId, userId });
        if (!period) {
            return res.status(404).json({ error: 'Period not found' });
        }

        const notes = await PeriodNote.find({ periodId, userId })
            .sort({ date: -1 });

        res.json({ notes });

    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Add new note
app.post('/api/period/notes', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { periodId, symptoms, medications, customNotes, date } = req.body;

        // Verify period belongs to user
        const period = await Period.findOne({ _id: periodId, userId });
        if (!period) {
            return res.status(404).json({ error: 'Period not found' });
        }

        const note = new PeriodNote({
            userId,
            periodId,
            date: date || new Date(),
            symptoms: symptoms || {},
            medications: medications || [],
            customNotes: customNotes || ''
        });

        await note.save();

        res.status(201).json({
            message: 'Note added successfully',
            note
        });

    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
});

// Update note
app.put('/api/period/notes/:noteId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { noteId } = req.params;
        const { symptoms, medications, customNotes } = req.body;

        const note = await PeriodNote.findOne({ _id: noteId, userId });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (symptoms) note.symptoms = { ...note.symptoms, ...symptoms };
        if (medications) note.medications = medications;
        if (customNotes !== undefined) note.customNotes = customNotes;

        await note.save();

        res.json({
            message: 'Note updated successfully',
            note
        });

    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// Delete note
app.delete('/api/period/notes/:noteId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { noteId } = req.params;

        const note = await PeriodNote.findOneAndDelete({ _id: noteId, userId });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({
            message: 'Note deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// Get pending reminders
app.get('/api/period/reminders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get active cycle
        const activeCycle = await Period.findOne({ userId, isActive: true });

        if (!activeCycle) {
            return res.json({ reminders: [] });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const predictedDate = new Date(activeCycle.predictedNextDate);
        predictedDate.setHours(0, 0, 0, 0);

        const daysUntil = Math.ceil((predictedDate - today) / (1000 * 60 * 60 * 24));

        const reminders = [];

        // 3-day advance warning
        if (daysUntil === 3 && !activeCycle.remindersSent.threeDayBefore) {
            reminders.push({
                type: '3-day',
                message: 'Your period is expected in 3 days',
                date: activeCycle.predictedNextDate,
                periodId: activeCycle._id
            });
        }

        // On-day reminder
        if (daysUntil === 0 && !activeCycle.remindersSent.onDay) {
            reminders.push({
                type: 'on-day',
                message: 'Your period is expected today',
                date: activeCycle.predictedNextDate,
                periodId: activeCycle._id
            });
        }

        res.json({ reminders });

    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({ error: 'Failed to fetch reminders' });
    }
});

// Dismiss reminder
app.post('/api/period/reminders/dismiss', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { periodId, type } = req.body;

        const period = await Period.findOne({ _id: periodId, userId });

        if (!period) {
            return res.status(404).json({ error: 'Period not found' });
        }

        if (type === '3-day') {
            period.remindersSent.threeDayBefore = true;
        } else if (type === 'on-day') {
            period.remindersSent.onDay = true;
        }

        await period.save();

        res.json({ message: 'Reminder dismissed' });

    } catch (error) {
        console.error('Error dismissing reminder:', error);
        res.status(500).json({ error: 'Failed to dismiss reminder' });
    }
});

// DIET TRACKER API ENDPOINTS

// Get all food items (with search)
app.get('/api/diet/foods', authenticateToken, async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        
        if (search) {
            query = { name: { $regex: search, $options: 'i' } };
        }
        
        const foods = await FoodItem.find(query)
            .sort({ isIndian: -1, name: 1 })
            .limit(50);
        
        res.json({ foods });
    } catch (error) {
        console.error('Error fetching foods:', error);
        res.status(500).json({ error: 'Failed to fetch foods' });
    }
});

// Get food logs for a date
app.get('/api/diet/logs', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { date } = req.query;
        
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const logs = await FoodLog.find({
            userId,
            date: { $gte: targetDate, $lt: nextDay }
        }).populate('foodItem').sort({ createdAt: 1 });
        
        res.json({ logs });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Add food log
app.post('/api/diet/logs', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { foodItemId, mealType, quantity, date } = req.body;
        
        const foodItem = await FoodItem.findById(foodItemId);
        if (!foodItem) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        
        // Calculate nutrition based on quantity
        const nutrition = {
            calories: Math.round(foodItem.nutrition.calories * quantity),
            protein: Math.round(foodItem.nutrition.protein * quantity * 10) / 10,
            carbs: Math.round(foodItem.nutrition.carbs * quantity * 10) / 10,
            fat: Math.round(foodItem.nutrition.fat * quantity * 10) / 10,
            fiber: Math.round(foodItem.nutrition.fiber * quantity * 10) / 10
        };
        
        const log = new FoodLog({
            userId,
            date: date || new Date(),
            mealType,
            foodItem: foodItemId,
            quantity,
            nutrition
        });
        
        await log.save();
        await log.populate('foodItem');
        
        res.status(201).json({ log });
    } catch (error) {
        console.error('Error adding log:', error);
        res.status(500).json({ error: 'Failed to add log' });
    }
});

// Delete food log
app.delete('/api/diet/logs/:logId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { logId } = req.params;
        
        const log = await FoodLog.findOneAndDelete({ _id: logId, userId });
        
        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }
        
        res.json({ message: 'Log deleted successfully' });
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ error: 'Failed to delete log' });
    }
});

// Seed initial food data (run once)
app.post('/api/diet/seed', authenticateToken, async (req, res) => {
    try {
        const count = await FoodItem.countDocuments();
        if (count > 0) {
            return res.json({ message: 'Database already seeded' });
        }
        
        const indianFoods = [
            { name: 'Roti (Wheat)', category: 'roti', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 71, protein: 3, carbs: 15, fat: 0.4, fiber: 2 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
            { name: 'Roti (Multigrain)', category: 'roti', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 75, protein: 3.5, carbs: 14, fat: 0.5, fiber: 3 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
            { name: 'Rice (White, Cooked)', category: 'rice', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 205, protein: 4.2, carbs: 45, fat: 0.4, fiber: 0.6 }, isIndian: true },
            { name: 'Rice (Brown, Cooked)', category: 'rice', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
            { name: 'Dal (Moong)', category: 'dal', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 212, protein: 14, carbs: 39, fat: 0.8, fiber: 15 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
            { name: 'Dal (Masoor)', category: 'dal', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 16 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
            { name: 'Paneer (100g)', category: 'paneer', servingSize: { amount: 100, unit: 'gram' }, nutrition: { calories: 265, protein: 18, carbs: 1.2, fat: 20, fiber: 0 }, isIndian: true, isPCOSFriendly: true },
            { name: 'Idli (2 pieces)', category: 'breakfast', servingSize: { amount: 2, unit: 'piece' }, nutrition: { calories: 78, protein: 2, carbs: 17, fat: 0.2, fiber: 1 }, isIndian: true, isLowGI: true },
            { name: 'Dosa (Plain)', category: 'breakfast', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 133, protein: 4, carbs: 25, fat: 1.5, fiber: 1.5 }, isIndian: true },
            { name: 'Poha', category: 'breakfast', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 180, protein: 3, carbs: 35, fat: 3, fiber: 2 }, isIndian: true },
            { name: 'Upma', category: 'breakfast', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 200, protein: 4, carbs: 38, fat: 4, fiber: 2 }, isIndian: true },
            { name: 'Paratha (Plain)', category: 'breakfast', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 126, protein: 3, carbs: 18, fat: 4.5, fiber: 2 }, isIndian: true },
            { name: 'Chana (Boiled)', category: 'snacks', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 269, protein: 15, carbs: 45, fat: 4, fiber: 12 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
            { name: 'Makhana (Roasted)', category: 'snacks', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 347, protein: 10, carbs: 77, fat: 0.5, fiber: 14 }, isIndian: true, isPCOSFriendly: true },
            { name: 'Banana', category: 'fruits', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3 }, isIndian: true },
            { name: 'Apple', category: 'fruits', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4 }, isIndian: true, isPCOSFriendly: true, isLowGI: true },
            { name: 'Papaya (1 cup)', category: 'fruits', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 62, protein: 0.7, carbs: 16, fat: 0.4, fiber: 2.5 }, isIndian: true, isPCOSFriendly: true },
            { name: 'Egg (Boiled)', category: 'other', servingSize: { amount: 1, unit: 'piece' }, nutrition: { calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0 }, isIndian: true, isPCOSFriendly: true },
            { name: 'Chicken Breast (100g)', category: 'other', servingSize: { amount: 100, unit: 'gram' }, nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }, isIndian: true, isPCOSFriendly: true },
            { name: 'Curd (1 cup)', category: 'other', servingSize: { amount: 1, unit: 'cup' }, nutrition: { calories: 98, protein: 11, carbs: 12, fat: 0.4, fiber: 0 }, isIndian: true, isPCOSFriendly: true }
        ];
        
        await FoodItem.insertMany(indianFoods);
        
        res.json({ message: 'Database seeded successfully', count: indianFoods.length });
    } catch (error) {
        console.error('Error seeding database:', error);
        res.status(500).json({ error: 'Failed to seed database' });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO server ready for connections`);
});


// DIET TRACKER API ENDPOINTS

// Get all food items with search
app.get('/api/diet/foods', authenticateToken, async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (category) {
            query.category = category;
        }
        
        // Prioritize Indian foods
        const foods = await FoodItem.find(query)
            .sort({ isIndian: -1, isPCOSFriendly: -1, name: 1 })
            .limit(50);
        
        res.json({ foods });
    } catch (error) {
        console.error('Error fetching foods:', error);
        res.status(500).json({ error: 'Failed to fetch foods' });
    }
});

// Get food logs for a specific date
app.get('/api/diet/logs', authenticateToken, async (req, res) => {
    try {
        const { date } = req.query;
        const userId = req.user.userId;
        
        const queryDate = date ? new Date(date) : new Date();
        queryDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const logs = await FoodLog.find({
            userId,
            date: { $gte: queryDate, $lt: nextDay }
        }).populate('foodItem').sort({ createdAt: 1 });
        
        res.json({ logs, date: queryDate });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Add food log
app.post('/api/diet/logs', authenticateToken, async (req, res) => {
    try {
        const { foodItemId, mealType, quantity, date } = req.body;
        const userId = req.user.userId;
        
        const foodItem = await FoodItem.findById(foodItemId);
        if (!foodItem) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        
        const logDate = date ? new Date(date) : new Date();
        logDate.setHours(0, 0, 0, 0);
        
        // Calculate nutrition based on quantity
        const nutrition = {
            calories: Math.round(foodItem.nutrition.calories * quantity),
            protein: Math.round(foodItem.nutrition.protein * quantity * 10) / 10,
            carbs: Math.round(foodItem.nutrition.carbs * quantity * 10) / 10,
            fat: Math.round(foodItem.nutrition.fat * quantity * 10) / 10,
            fiber: Math.round(foodItem.nutrition.fiber * quantity * 10) / 10
        };
        
        const log = new FoodLog({
            userId,
            date: logDate,
            mealType,
            foodItem: foodItemId,
            quantity,
            nutrition
        });
        
        await log.save();
        await log.populate('foodItem');
        
        res.json({ log, message: 'Food logged successfully' });
    } catch (error) {
        console.error('Error adding log:', error);
        res.status(500).json({ error: 'Failed to add food log' });
    }
});

// Delete food log
app.delete('/api/diet/logs/:logId', authenticateToken, async (req, res) => {
    try {
        const { logId } = req.params;
        const userId = req.user.userId;
        
        const log = await FoodLog.findOneAndDelete({ _id: logId, userId });
        
        if (!log) {
            return res.status(404).json({ error: 'Log not found' });
        }
        
        res.json({ message: 'Log deleted successfully' });
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ error: 'Failed to delete log' });
    }
});

// Get nutrition summary and recommendations
app.get('/api/diet/summary', authenticateToken, async (req, res) => {
    try {
        const { date } = req.query;
        const userId = req.user.userId;
        
        const queryDate = date ? new Date(date) : new Date();
        queryDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const logs = await FoodLog.find({
            userId,
            date: { $gte: queryDate, $lt: nextDay }
        }).populate('foodItem');
        
        // Calculate totals
        const totals = logs.reduce((acc, log) => ({
            calories: acc.calories + (log.nutrition.calories || 0),
            protein: acc.protein + (log.nutrition.protein || 0),
            carbs: acc.carbs + (log.nutrition.carbs || 0),
            fat: acc.fat + (log.nutrition.fat || 0),
            fiber: acc.fiber + (log.nutrition.fiber || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
        
        // PCOS-friendly targets
        const targets = {
            calories: 1800,
            protein: 100,
            carbs: 150,
            fat: 60,
            fiber: 25
        };
        
        // Generate recommendations
        const recommendations = [];
        
        if (totals.protein < targets.protein * 0.7) {
            const deficit = Math.round(targets.protein - totals.protein);
            recommendations.push({
                type: 'protein',
                message: `You're low on protein by ${deficit}g. Add paneer, dal, or sprouts.`,
                priority: 'high'
            });
        }
        
        if (totals.fiber < targets.fiber * 0.6) {
            recommendations.push({
                type: 'fiber',
                message: 'Increase fiber intake with vegetables, fruits, or whole grains.',
                priority: 'medium'
            });
        }
        
        if (totals.carbs > targets.carbs * 1.3) {
            recommendations.push({
                type: 'carbs',
                message: 'Consider reducing refined carbs. Choose low-GI options like brown rice or ragi roti.',
                priority: 'high'
            });
        }
        
        // Check for PCOS-friendly foods
        const pcosUnfriendlyCount = logs.filter(log => 
            log.foodItem && !log.foodItem.isPCOSFriendly
        ).length;
        
        if (pcosUnfriendlyCount > 3) {
            recommendations.push({
                type: 'pcos',
                message: 'Try to include more PCOS-friendly, low-GI foods for better hormone balance.',
                priority: 'medium'
            });
        }
        
        res.json({ totals, targets, recommendations, logsCount: logs.length });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

// Get weekly stats
app.get('/api/diet/weekly', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 6);
        
        const logs = await FoodLog.find({
            userId,
            date: { $gte: weekAgo, $lte: today }
        });
        
        // Group by date
        const dailyStats = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekAgo);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            dailyStats[dateStr] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        
        logs.forEach(log => {
            const dateStr = log.date.toISOString().split('T')[0];
            if (dailyStats[dateStr]) {
                dailyStats[dateStr].calories += log.nutrition.calories || 0;
                dailyStats[dateStr].protein += log.nutrition.protein || 0;
                dailyStats[dateStr].carbs += log.nutrition.carbs || 0;
                dailyStats[dateStr].fat += log.nutrition.fat || 0;
            }
        });
        
        res.json({ dailyStats });
    } catch (error) {
        console.error('Error fetching weekly stats:', error);
        res.status(500).json({ error: 'Failed to fetch weekly stats' });
    }
});
