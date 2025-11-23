import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AddFoodModal from '../components/AddFoodModal';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface FoodItem {
  _id: string;
  name: string;
  category: string;
  servingSize: { amount: number; unit: string };
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  isIndian: boolean;
  isPCOSFriendly: boolean;
  isLowGI: boolean;
}

interface FoodLog {
  _id: string;
  mealType: string;
  quantity: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  foodItem: FoodItem;
}

interface Recommendation {
  type: string;
  message: string;
  priority: string;
}

const DietTrackerPage: React.FC = () => {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<string>('breakfast');
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const [targets] = useState({ calories: 1800, protein: 100, carbs: 150, fat: 60, fiber: 25 });
  const [weeklyStats, setWeeklyStats] = useState<any>({});
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [dietRecommendations, setDietRecommendations] = useState<any>(null);
  const [showRecommendationBanner, setShowRecommendationBanner] = useState(false);
  const { token } = useAuth();

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchLogs();
    fetchFoods();
    fetchSummary();
    fetchWeeklyStats();
    checkForDietRecommendations();
  }, [currentDate]);

  const checkForDietRecommendations = () => {
    const savedRecommendations = localStorage.getItem('dietRecommendations');
    if (savedRecommendations) {
      const recommendations = JSON.parse(savedRecommendations);
      setDietRecommendations(recommendations);
      setShowRecommendationBanner(true);
      // Clear the recommendations after showing them
      localStorage.removeItem('dietRecommendations');
    }
  };

  const fetchLogs = async () => {
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const response = await axios.get(`${API_BASE_URL}/api/diet/logs`, {
        params: { date: dateStr },
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data.logs);
      
      // Track recent foods
      const recent = response.data.logs.map((log: FoodLog) => log.foodItem).slice(0, 5);
      setRecentFoods(recent);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const fetchFoods = async (search = '') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/diet/foods`, {
        params: { search },
        headers: { Authorization: `Bearer ${token}` }
      });
      setFoods(response.data.foods);
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const response = await axios.get(`${API_BASE_URL}/api/diet/summary`, {
        params: { date: dateStr },
        headers: { Authorization: `Bearer ${token}` }
      });
      setTotals(response.data.totals);
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/diet/weekly`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWeeklyStats(response.data.dailyStats);
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
    }
  };

  const handleSearch = (query: string) => {
    fetchFoods(query);
  };

  const handleAddFood = async (food: FoodItem, quantity: number) => {
    setLoading(true);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      await axios.post(
        `${API_BASE_URL}/api/diet/logs`,
        {
          foodItemId: food._id,
          mealType: selectedMeal,
          quantity,
          date: dateStr
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchLogs();
      fetchSummary();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding food:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (logId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/diet/logs/${logId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogs();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  const getMealLogs = (mealType: string) => {
    return logs.filter(log => log.mealType === mealType);
  };

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    if (newDate <= new Date()) {
      setCurrentDate(newDate);
    }
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const getProgressColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage < 70) return 'bg-red-500';
    if (percentage < 90) return 'bg-yellow-500';
    if (percentage <= 110) return 'bg-green-500';
    return 'bg-orange-500';
  };

  const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header with Date Navigation */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Diet Tracker</h1>
              <p className="text-gray-600">Track your meals and nutrition for PCOS management</p>
            </div>
            <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm px-4 py-2">
              <button onClick={handlePrevDay} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <span className="font-medium text-gray-900 min-w-[140px] text-center">
                {currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <button onClick={handleNextDay} disabled={isToday()} className="p-1 hover:bg-gray-100 rounded disabled:opacity-50">
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Diet Recommendations Banner */}
          {showRecommendationBanner && dietRecommendations && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">
                      Diet Tracking Started with AI Recommendations!
                    </h3>
                    <p className="text-green-700 text-sm mb-2">
                      You're now tracking your diet based on your {dietRecommendations.pcosDetected ? 'PCOS-specific' : 'personalized'} AI recommendations. 
                      Follow the meal suggestions below for optimal results.
                    </p>
                    <div className="text-xs text-green-600">
                      <strong>Plan Type:</strong> {dietRecommendations.pcosDetected ? 'PCOS-Friendly Diet' : 'General Healthy Diet'} • 
                      <strong> Started:</strong> {new Date(dietRecommendations.startedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRecommendationBanner(false)}
                  className="text-green-600 hover:text-green-800 p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Daily Summary - Sticky */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-md p-6 mb-6 sticky top-0 z-10 border border-purple-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Today's Nutrition</h2>
              <span className="text-sm text-purple-600 font-medium">PCOS-Friendly Goals</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Calories</p>
                <p className="text-2xl font-bold text-purple-600">{totals.calories}</p>
                <p className="text-xs text-gray-500">/ {targets.calories}</p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressColor(totals.calories, targets.calories)} transition-all`} 
                       style={{ width: `${Math.min(100, (totals.calories / targets.calories) * 100)}%` }}></div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Protein</p>
                <p className="text-2xl font-bold text-blue-600">{totals.protein.toFixed(1)}g</p>
                <p className="text-xs text-gray-500">/ {targets.protein}g</p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressColor(totals.protein, targets.protein)} transition-all`} 
                       style={{ width: `${Math.min(100, (totals.protein / targets.protein) * 100)}%` }}></div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Carbs</p>
                <p className="text-2xl font-bold text-green-600">{totals.carbs.toFixed(1)}g</p>
                <p className="text-xs text-gray-500">/ {targets.carbs}g</p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressColor(totals.carbs, targets.carbs)} transition-all`} 
                       style={{ width: `${Math.min(100, (totals.carbs / targets.carbs) * 100)}%` }}></div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Fat</p>
                <p className="text-2xl font-bold text-yellow-600">{totals.fat.toFixed(1)}g</p>
                <p className="text-xs text-gray-500">/ {targets.fat}g</p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressColor(totals.fat, targets.fat)} transition-all`} 
                       style={{ width: `${Math.min(100, (totals.fat / targets.fat) * 100)}%` }}></div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Fiber</p>
                <p className="text-2xl font-bold text-orange-600">{totals.fiber.toFixed(1)}g</p>
                <p className="text-xs text-gray-500">/ {targets.fiber}g</p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressColor(totals.fiber, targets.fiber)} transition-all`} 
                       style={{ width: `${Math.min(100, (totals.fiber / targets.fiber) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-5 mb-6 border-l-4 border-purple-500">
              <div className="flex items-center mb-3">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Smart Nutrition Feedback</h3>
              </div>
              <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className={`flex items-start p-3 rounded-lg ${
                    rec.priority === 'high' ? 'bg-red-50' : 'bg-blue-50'
                  }`}>
                    {rec.priority === 'high' ? (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm text-gray-700">{rec.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meals */}
          {meals.map(meal => {
            const mealLogs = getMealLogs(meal);
            const mealCalories = mealLogs.reduce((sum, log) => sum + log.nutrition.calories, 0);
            
            return (
              <div key={meal} className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold capitalize text-gray-900">{meal}</h3>
                    {mealCalories > 0 && (
                      <p className="text-sm text-purple-600 font-medium">{mealCalories} calories</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMeal(meal);
                      setShowAddModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Food</span>
                  </button>
                </div>
                
                {mealLogs.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">No foods logged for {meal}</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Add Food" to start tracking</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mealLogs.map(log => (
                      <div key={log._id} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{log.foodItem.name}</p>
                            {log.foodItem.isPCOSFriendly && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">PCOS-Friendly</span>
                            )}
                            {log.foodItem.isLowGI && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Low-GI</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {log.quantity} × {log.foodItem.servingSize.amount} {log.foodItem.servingSize.unit}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-lg text-gray-900">{log.nutrition.calories} cal</p>
                            <p className="text-xs text-gray-600">
                              P: {log.nutrition.protein.toFixed(1)}g | C: {log.nutrition.carbs.toFixed(1)}g | F: {log.nutrition.fat.toFixed(1)}g
                            </p>
                          </div>
                          <button
                            onClick={() => deleteLog(log._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AddFoodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddFood}
        foods={foods}
        recentFoods={recentFoods}
        mealType={selectedMeal}
        onSearch={handleSearch}
        loading={loading}
      />

      <Footer />
    </div>
  );
};

export default DietTrackerPage;