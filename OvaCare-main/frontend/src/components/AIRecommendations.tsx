import React, { useState } from 'react';
import { Brain, Clock, Apple, AlertTriangle, Lightbulb, Pill, ChevronDown, ChevronUp, Save, Printer, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface MealPlan {
  meal: string;
  options: string[];
  calories: string;
  timing: string;
}

interface Recommendations {
  mealPlan: MealPlan[];
  guidelines: string[];
  foodsToInclude: string[];
  foodsToAvoid: string[];
  supplements: string[];
  tips: string[];
}

interface AIRecommendationsProps {
  recommendations: Recommendations;
  pcosDetected: boolean;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ recommendations, pcosDetected }) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    mealPlan: true,
    guidelines: false,
    foods: false,
    supplements: false,
    tips: false
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const navigate = useNavigate();
  const { token } = useAuth();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSaveDietPlan = async () => {
    if (!token) {
      setSaveMessage('Please log in to save your diet plan');
      return;
    }

    setSaving(true);
    setSaveMessage('');

    try {
      const dietPlanData = {
        pcosDetected,
        recommendations,
        savedAt: new Date().toISOString(),
        planType: pcosDetected ? 'PCOS-Friendly' : 'General Healthy'
      };

      const response = await axios.post(
        'http://localhost:5000/api/diet/save-plan',
        dietPlanData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSaveMessage('Diet plan saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving diet plan:', error);
      setSaveMessage('Failed to save diet plan. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePrintRecommendations = () => {
    // Create a printable version of the recommendations
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OvaCare - Diet Recommendations</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; }
            .section { margin-bottom: 25px; }
            .section-title { color: #7c3aed; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .meal-plan { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
            .meal { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
            .meal-title { font-weight: bold; color: #374151; margin-bottom: 8px; }
            .meal-timing { color: #6b7280; font-size: 14px; }
            .food-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .food-list { list-style: none; padding: 0; }
            .food-list li { margin-bottom: 5px; padding-left: 20px; position: relative; }
            .include::before { content: "✓"; color: green; position: absolute; left: 0; }
            .avoid::before { content: "✗"; color: red; position: absolute; left: 0; }
            .guideline, .tip { margin-bottom: 8px; padding-left: 20px; position: relative; }
            .guideline::before { content: "•"; color: #7c3aed; position: absolute; left: 0; font-weight: bold; }
            .disclaimer { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>OvaCare - Personalized Diet Recommendations</h1>
            <p><strong>Plan Type:</strong> ${pcosDetected ? 'PCOS-Friendly Diet Plan' : 'General Healthy Diet Plan'}</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h2 class="section-title">Daily Meal Plan</h2>
            <div class="meal-plan">
              ${recommendations.mealPlan.map(meal => `
                <div class="meal">
                  <div class="meal-title">${meal.meal}</div>
                  <div class="meal-timing">${meal.timing} • ${meal.calories}</div>
                  <ul style="margin: 10px 0; padding-left: 15px;">
                    ${meal.options.map(option => `<li>${option}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Dietary Guidelines</h2>
            ${recommendations.guidelines.map(guideline => `<div class="guideline">${guideline}</div>`).join('')}
          </div>

          <div class="section">
            <h2 class="section-title">Food Recommendations</h2>
            <div class="food-grid">
              <div>
                <h3 style="color: #059669;">Foods to Include</h3>
                <ul class="food-list">
                  ${recommendations.foodsToInclude.map(food => `<li class="include">${food}</li>`).join('')}
                </ul>
              </div>
              <div>
                <h3 style="color: #dc2626;">Foods to Limit/Avoid</h3>
                <ul class="food-list">
                  ${recommendations.foodsToAvoid.map(food => `<li class="avoid">${food}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>

          ${recommendations.supplements.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Supplement Considerations</h2>
              ${recommendations.supplements.map(supplement => `<div class="guideline">${supplement}</div>`).join('')}
              <p style="color: #d97706; font-weight: bold; margin-top: 10px;">
                ⚠️ Always consult with your healthcare provider before starting any new supplements.
              </p>
            </div>
          ` : ''}

          <div class="section">
            <h2 class="section-title">Practical Tips</h2>
            ${recommendations.tips.map(tip => `<div class="tip">${tip}</div>`).join('')}
          </div>

          <div class="disclaimer">
            <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical diagnosis. Please consult with a qualified healthcare provider for proper medical evaluation.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleStartDietTracking = () => {
    // Save current recommendations to localStorage for the diet tracker
    localStorage.setItem('dietRecommendations', JSON.stringify({
      pcosDetected,
      recommendations,
      startedAt: new Date().toISOString()
    }));
    
    // Navigate to diet tracker page
    navigate('/diet-tracker');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-lg p-6 ${pcosDetected ? 'bg-purple-50 border border-purple-200' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex items-center mb-4">
          <Brain className={`h-8 w-8 mr-3 ${pcosDetected ? 'text-purple-600' : 'text-green-600'}`} />
          <div>
            <h3 className={`text-xl font-bold ${pcosDetected ? 'text-purple-900' : 'text-green-900'}`}>
              AI-Generated Diet Plan
            </h3>
            <p className={`${pcosDetected ? 'text-purple-700' : 'text-green-700'}`}>
              {pcosDetected 
                ? 'Specialized nutrition plan for PCOS management'
                : 'Balanced nutrition plan for optimal health'
              }
            </p>
          </div>
        </div>
        
        <div className={`p-4 rounded-md ${pcosDetected ? 'bg-purple-100' : 'bg-green-100'}`}>
          <p className={`text-sm ${pcosDetected ? 'text-purple-800' : 'text-green-800'}`}>
            <strong>AI Analysis:</strong> This personalized diet plan has been generated based on your PCOS detection results 
            and current nutritional science. The recommendations focus on {pcosDetected ? 'managing insulin resistance, reducing inflammation, and supporting hormonal balance' : 'maintaining overall health and preventing chronic diseases'}.
          </p>
        </div>
      </div>

      {/* Meal Plan */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => toggleSection('mealPlan')}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-600 mr-3" />
            <h4 className="text-lg font-semibold text-gray-900">Daily Meal Plan</h4>
          </div>
          {expandedSections.mealPlan ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {expandedSections.mealPlan && (
          <div className="p-6">
            <div className="grid gap-4">
              {recommendations.mealPlan.map((meal, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-semibold text-gray-900">{meal.meal}</h5>
                    <div className="text-right text-sm text-gray-600">
                      <div>{meal.calories}</div>
                      <div>{meal.timing}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {meal.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => toggleSection('guidelines')}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center">
            <Lightbulb className="h-5 w-5 text-gray-600 mr-3" />
            <h4 className="text-lg font-semibold text-gray-900">Dietary Guidelines</h4>
          </div>
          {expandedSections.guidelines ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {expandedSections.guidelines && (
          <div className="p-6">
            <ul className="space-y-3">
              {recommendations.guidelines.map((guideline, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{guideline}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Foods to Include/Avoid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => toggleSection('foods')}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center">
            <Apple className="h-5 w-5 text-gray-600 mr-3" />
            <h4 className="text-lg font-semibold text-gray-900">Food Recommendations</h4>
          </div>
          {expandedSections.foods ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {expandedSections.foods && (
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Foods to Include
                </h5>
                <ul className="space-y-2">
                  {recommendations.foodsToInclude.map((food, index) => (
                    <li key={index} className="text-gray-700 text-sm flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {food}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold text-red-800 mb-3 flex items-center">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Foods to Limit/Avoid
                </h5>
                <ul className="space-y-2">
                  {recommendations.foodsToAvoid.map((food, index) => (
                    <li key={index} className="text-gray-700 text-sm flex items-center">
                      <span className="text-red-500 mr-2">✗</span>
                      {food}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Supplements */}
      {recommendations.supplements.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => toggleSection('supplements')}
            className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center">
              <Pill className="h-5 w-5 text-gray-600 mr-3" />
              <h4 className="text-lg font-semibold text-gray-900">Supplement Considerations</h4>
            </div>
            {expandedSections.supplements ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {expandedSections.supplements && (
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <p className="text-yellow-800 text-sm">
                    <strong>Important:</strong> Always consult with your healthcare provider before starting any new supplements, 
                    especially if you have PCOS or other medical conditions.
                  </p>
                </div>
              </div>
              
              <ul className="space-y-3">
                {recommendations.supplements.map((supplement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{supplement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => toggleSection('tips')}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center">
            <Lightbulb className="h-5 w-5 text-gray-600 mr-3" />
            <h4 className="text-lg font-semibold text-gray-900">Practical Tips</h4>
          </div>
          {expandedSections.tips ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {expandedSections.tips && (
          <div className="p-6">
            <div className="grid gap-3">
              {recommendations.tips.map((tip, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                      💡
                    </span>
                    <span className="text-gray-700">{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`text-center p-3 rounded-lg mb-4 ${
          saveMessage.includes('successfully') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button 
          onClick={handleSaveDietPlan}
          disabled={saving}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save My Diet Plan
            </>
          )}
        </button>
        
        <button 
          onClick={handlePrintRecommendations}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Recommendations
        </button>
        
        <button 
          onClick={handleStartDietTracking}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Start Diet Tracking
        </button>
      </div>
    </div>
  );
};

export default AIRecommendations;