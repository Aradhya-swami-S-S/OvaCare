import React, { useState } from 'react';
import { PieChart, Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface MealLogProps {
  meal: string;
  time: string;
  foods: Array<{name: string; calories: number; protein: number; carbs: number; fat: number}>;
  onAddFood: (meal: string) => void;
}

const MealLog: React.FC<MealLogProps> = ({ meal, time, foods, onAddFood }) => {
  const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{meal}</h4>
          <p className="text-sm text-gray-500">{time}</p>
        </div>
        <span className="text-purple-700 font-medium">{totalCalories} cal</span>
      </div>
      
      {foods.length > 0 ? (
        <div className="mb-3">
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-2">Food</th>
                <th className="text-right py-2">Cal</th>
                <th className="text-right py-2 hidden md:table-cell">Protein</th>
                <th className="text-right py-2 hidden md:table-cell">Carbs</th>
                <th className="text-right py-2 hidden md:table-cell">Fat</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 text-gray-800">{food.name}</td>
                  <td className="py-2 text-right text-gray-800">{food.calories}</td>
                  <td className="py-2 text-right text-gray-800 hidden md:table-cell">{food.protein}g</td>
                  <td className="py-2 text-right text-gray-800 hidden md:table-cell">{food.carbs}g</td>
                  <td className="py-2 text-right text-gray-800 hidden md:table-cell">{food.fat}g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic mb-3">No foods logged yet</p>
      )}
      
      <button 
        onClick={() => onAddFood(meal)}
        className="w-full py-2 text-purple-600 border border-purple-200 rounded-md hover:bg-purple-50 flex items-center justify-center transition-colors"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Food
      </button>
    </div>
  );
};

const DietTracker: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('');
  
  const meals = [
    {
      meal: 'Breakfast',
      time: '7:30 AM',
      foods: [
        {name: 'Greek Yogurt', calories: 120, protein: 15, carbs: 5, fat: 3},
        {name: 'Blueberries', calories: 80, protein: 1, carbs: 20, fat: 0},
        {name: 'Chia Seeds', calories: 60, protein: 2, carbs: 4, fat: 4}
      ]
    },
    {
      meal: 'Lunch',
      time: '12:30 PM',
      foods: [
        {name: 'Quinoa Salad', calories: 350, protein: 12, carbs: 45, fat: 12},
        {name: 'Grilled Chicken', calories: 180, protein: 35, carbs: 0, fat: 4}
      ]
    },
    {
      meal: 'Dinner',
      time: '7:00 PM',
      foods: []
    },
    {
      meal: 'Snacks',
      time: 'Throughout day',
      foods: [
        {name: 'Almonds', calories: 160, protein: 6, carbs: 6, fat: 14}
      ]
    }
  ];
  
  const totalCalories = meals.reduce((sum, meal) => {
    return sum + meal.foods.reduce((mealSum, food) => mealSum + food.calories, 0);
  }, 0);
  
  const totalNutrients = meals.reduce((sum, meal) => {
    meal.foods.forEach(food => {
      sum.protein += food.protein;
      sum.carbs += food.carbs;
      sum.fat += food.fat;
    });
    return sum;
  }, {protein: 0, carbs: 0, fat: 0});
  
  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };
  
  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  const handleAddFood = (meal: string) => {
    setSelectedMeal(meal);
    setShowFoodModal(true);
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Diet Tracker</h2>
        <div className="flex items-center">
          <button 
            onClick={handlePrevDay}
            className="p-1 text-gray-600 hover:text-purple-700"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center mx-2 px-3 py-1 bg-purple-50 rounded-md">
            <Calendar className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-gray-800">
              {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <button 
            onClick={handleNextDay}
            className="p-1 text-gray-600 hover:text-purple-700"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="col-span-1 md:col-span-2">
          <div className="bg-purple-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-purple-800">Daily Summary</h3>
              <span className="text-sm text-purple-600">PCOS-Friendly Plan</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2 rounded-md">
                <p className="text-gray-500 text-xs">Calories</p>
                <p className="font-semibold text-gray-900">{totalCalories} / 1800</p>
                <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${Math.min(100, (totalCalories / 1800) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-white p-2 rounded-md">
                <p className="text-gray-500 text-xs">Protein</p>
                <p className="font-semibold text-gray-900">{totalNutrients.protein}g</p>
                <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.min(100, (totalNutrients.protein / 100) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-white p-2 rounded-md">
                <p className="text-gray-500 text-xs">Carbs</p>
                <p className="font-semibold text-gray-900">{totalNutrients.carbs}g</p>
                <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (totalNutrients.carbs / 150) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-white p-2 rounded-md">
                <p className="text-gray-500 text-xs">Fat</p>
                <p className="font-semibold text-gray-900">{totalNutrients.fat}g</p>
                <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${Math.min(100, (totalNutrients.fat / 60) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {meals.map((meal, index) => (
            <MealLog 
              key={index}
              meal={meal.meal}
              time={meal.time}
              foods={meal.foods}
              onAddFood={handleAddFood}
            />
          ))}
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Macronutrient Breakdown</h3>
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-32">
                <PieChart className="w-full h-full text-gray-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-700">{totalCalories}</p>
                    <p className="text-xs text-gray-500">calories</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Protein</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {totalNutrients.protein}g ({Math.round((totalNutrients.protein * 4 / totalCalories) * 100)}%)
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Carbs</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {totalNutrients.carbs}g ({Math.round((totalNutrients.carbs * 4 / totalCalories) * 100)}%)
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm text-gray-700">Fat</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {totalNutrients.fat}g ({Math.round((totalNutrients.fat * 9 / totalCalories) * 100)}%)
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Weekly Progress</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Calories</p>
                <div className="flex items-center h-10">
                  {[1450, 1560, 1790, 1620, 1550, 1380, totalCalories].map((cal, idx) => (
                    <div 
                      key={idx}
                      className="flex-1 mx-0.5"
                    >
                      <div className="relative h-8">
                        <div 
                          className={`absolute bottom-0 w-full bg-purple-${Math.floor((cal/1800)*100)}`}
                          style={{ 
                            height: `${Math.min(100, (cal/1800)*100)}%`,
                            backgroundColor: idx === 6 ? '#8A4FFF' : '#D1C4E9'
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-center mt-1">{['M','T','W','T','F','S','S'][idx]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-2">Nutrition Tips</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="inline-block h-4 w-4 rounded-full bg-purple-200 text-purple-700 text-center text-xs mr-2 flex-shrink-0 mt-0.5">✓</span>
                Try to include more leafy greens to boost your vitamin intake
              </li>
              <li className="flex items-start">
                <span className="inline-block h-4 w-4 rounded-full bg-purple-200 text-purple-700 text-center text-xs mr-2 flex-shrink-0 mt-0.5">✓</span>
                Consider adding cinnamon to your breakfast to help regulate blood sugar
              </li>
              <li className="flex items-start">
                <span className="inline-block h-4 w-4 rounded-full bg-purple-200 text-purple-700 text-center text-xs mr-2 flex-shrink-0 mt-0.5">✓</span>
                Stay hydrated! Aim for at least 8 glasses of water today
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {showFoodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Add Food to {selectedMeal}</h3>
            <div className="mb-4">
              <input 
                type="text"
                placeholder="Search for a food..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="max-h-60 overflow-y-auto mb-4">
              <ul className="divide-y divide-gray-100">
                {[
                  {name: 'Greek Yogurt', calories: 120},
                  {name: 'Banana', calories: 105},
                  {name: 'Almonds (1oz)', calories: 160},
                  {name: 'Chicken Breast (3oz)', calories: 120},
                  {name: 'Quinoa (1/2 cup)', calories: 110},
                  {name: 'Avocado (1/2)', calories: 160},
                  {name: 'Salmon (3oz)', calories: 177},
                  {name: 'Sweet Potato (1 medium)', calories: 103},
                ].map((food, idx) => (
                  <li key={idx} className="py-2 hover:bg-gray-50 cursor-pointer">
                    <div className="flex justify-between">
                      <span className="text-gray-800">{food.name}</span>
                      <span className="text-gray-500">{food.calories} cal</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowFoodModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFoodModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md"
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietTracker;