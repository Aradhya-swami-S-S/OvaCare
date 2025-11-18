import React, { useState } from 'react';
import { Search, X, Clock } from 'lucide-react';

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

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (food: FoodItem, quantity: number) => void;
  foods: FoodItem[];
  recentFoods: FoodItem[];
  mealType: string;
  onSearch: (query: string) => void;
  loading: boolean;
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  foods,
  recentFoods,
  mealType,
  onSearch,
  loading
}) => {
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecent, setShowRecent] = useState(true);

  if (!isOpen) return null;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowRecent(query.length === 0);
    onSearch(query);
  };

  const handleAddFood = () => {
    if (selectedFood) {
      onAdd(selectedFood, quantity);
      setSelectedFood(null);
      setQuantity(1);
      setSearchQuery('');
    }
  };

  const displayFoods = showRecent && recentFoods.length > 0 ? recentFoods : foods;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Add Food</h2>
              <p className="text-purple-100 text-sm mt-1">to {mealType}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Indian foods, rotis, dal, sabzi..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Recent Foods */}
          {showRecent && recentFoods.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Clock className="h-4 w-4 mr-1" />
                <span>Recently Added</span>
              </div>
            </div>
          )}

          {/* Food List */}
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-2">
            {displayFoods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No foods found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              displayFoods.map(food => (
                <button
                  key={food._id}
                  onClick={() => setSelectedFood(food)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedFood?._id === food._id
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-gray-900">{food.name}</p>
                        {food.isIndian && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">Indian</span>
                        )}
                        {food.isPCOSFriendly && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">PCOS-Friendly</span>
                        )}
                        {food.isLowGI && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Low-GI</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {food.servingSize.amount} {food.servingSize.unit} • {food.category}
                      </p>
                      <div className="flex space-x-4 mt-2 text-xs text-gray-700">
                        <span className="font-medium">{food.nutrition.calories} cal</span>
                        <span>P: {food.nutrition.protein}g</span>
                        <span>C: {food.nutrition.carbs}g</span>
                        <span>F: {food.nutrition.fat}g</span>
                        <span>Fiber: {food.nutrition.fiber}g</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Selected Food Details & Quantity */}
          {selectedFood && (
            <div className="bg-purple-50 rounded-lg p-4 mb-4 border-2 border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-3">Selected: {selectedFood.name}</h3>
              
              {/* Quantity Slider */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <span className="text-lg font-bold text-purple-600">
                    {quantity} × {selectedFood.servingSize.amount} {selectedFood.servingSize.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5x</span>
                  <span>1x</span>
                  <span>2x</span>
                  <span>3x</span>
                  <span>4x</span>
                  <span>5x</span>
                </div>
              </div>

              {/* Calculated Nutrition */}
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-2">Total Nutrition:</p>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-purple-600">
                      {Math.round(selectedFood.nutrition.calories * quantity)}
                    </p>
                    <p className="text-xs text-gray-600">cal</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">
                      {(selectedFood.nutrition.protein * quantity).toFixed(1)}g
                    </p>
                    <p className="text-xs text-gray-600">protein</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      {(selectedFood.nutrition.carbs * quantity).toFixed(1)}g
                    </p>
                    <p className="text-xs text-gray-600">carbs</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-600">
                      {(selectedFood.nutrition.fat * quantity).toFixed(1)}g
                    </p>
                    <p className="text-xs text-gray-600">fat</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">
                      {(selectedFood.nutrition.fiber * quantity).toFixed(1)}g
                    </p>
                    <p className="text-xs text-gray-600">fiber</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddFood}
              disabled={!selectedFood || loading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? 'Adding...' : 'Add to Meal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFoodModal;
