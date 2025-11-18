import React from 'react';
import { Calendar, Clock, Tag } from 'lucide-react';

interface MealProps {
  title: string;
  description: string;
  calories: number;
  image: string;
}

const Meal: React.FC<MealProps> = ({ title, description, calories, image }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-lg text-gray-900 mb-2">{title}</h4>
        <p className="text-gray-600 text-sm mb-2">{description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <Tag className="h-4 w-4 mr-1" />
          <span>{calories} calories</span>
        </div>
      </div>
    </div>
  );
};

interface DietPlanProps {
  type: 'pcos' | 'normal';
}

const DietPlan: React.FC<DietPlanProps> = ({ type }) => {
  const meals = type === 'pcos' 
    ? [
        {
          title: 'Breakfast',
          description: 'Greek yogurt with berries, chia seeds, and a sprinkle of cinnamon',
          calories: 320,
          image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600'
        },
        {
          title: 'Lunch',
          description: 'Quinoa salad with grilled chicken, avocado, and mixed greens',
          calories: 450,
          image: 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=600'
        },
        {
          title: 'Dinner',
          description: 'Baked salmon with roasted vegetables and brown rice',
          calories: 520,
          image: 'https://images.pexels.com/photos/842142/pexels-photo-842142.jpeg?auto=compress&cs=tinysrgb&w=600'
        },
        {
          title: 'Snack',
          description: 'Handful of almonds and an apple',
          calories: 200,
          image: 'https://images.pexels.com/photos/1120575/pexels-photo-1120575.jpeg?auto=compress&cs=tinysrgb&w=600'
        }
      ]
    : [
        {
          title: 'Breakfast',
          description: 'Oatmeal with banana, honey, and walnuts',
          calories: 350,
          image: 'https://images.pexels.com/photos/4397920/pexels-photo-4397920.jpeg?auto=compress&cs=tinysrgb&w=600'
        },
        {
          title: 'Lunch',
          description: 'Mediterranean sandwich with whole grain bread and side salad',
          calories: 420,
          image: 'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=600'
        },
        {
          title: 'Dinner',
          description: 'Vegetable stir fry with tofu and brown rice',
          calories: 480,
          image: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=600'
        },
        {
          title: 'Snack',
          description: 'Greek yogurt with honey and mixed berries',
          calories: 180,
          image: 'https://images.pexels.com/photos/1435706/pexels-photo-1435706.jpeg?auto=compress&cs=tinysrgb&w=600'
        }
      ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {type === 'pcos' ? 'PCOS-Friendly Diet Plan' : 'General Healthy Diet Plan'}
        </h2>
        <p className="text-gray-600">
          {type === 'pcos' 
            ? 'A low-glycemic, anti-inflammatory diet plan designed to help manage PCOS symptoms.' 
            : 'A balanced diet plan focused on overall health and wellness.'}
        </p>
      </div>

      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-purple-800 mb-2">Diet Guidelines</h3>
        <ul className="text-gray-700 space-y-2">
          {type === 'pcos' ? (
            <>
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-purple-200 text-purple-700 text-center mr-2">✓</span>
                Focus on low glycemic index foods to help manage insulin resistance
              </li>
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-purple-200 text-purple-700 text-center mr-2">✓</span>
                Include anti-inflammatory foods like leafy greens, berries, and fatty fish
              </li>
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-purple-200 text-purple-700 text-center mr-2">✓</span>
                Prioritize lean proteins and healthy fats to support hormone balance
              </li>
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-purple-200 text-purple-700 text-center mr-2">✓</span>
                Limit processed foods, refined carbohydrates, and added sugars
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-purple-200 text-purple-700 text-center mr-2">✓</span>
                Maintain a balanced diet with a variety of fruits, vegetables, and whole grains
              </li>
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-purple-200 text-purple-700 text-center mr-2">✓</span>
                Include adequate protein from both plant and animal sources
              </li>
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-purple-200 text-purple-700 text-center mr-2">✓</span>
                Stay hydrated and limit sugary beverages
              </li>
              <li className="flex items-start">
                <span className="inline-block h-5 w-5 rounded-full bg-purple-200 text-purple-700 text-center mr-2">✓</span>
                Practice mindful eating and portion control
              </li>
            </>
          )}
        </ul>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Today's Meal Plan</h3>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-1" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {meals.map((meal, index) => (
            <Meal key={index} {...meal} />
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
          Save Plan
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
          Track in My Journal
        </button>
      </div>
    </div>
  );
};

export default DietPlan;