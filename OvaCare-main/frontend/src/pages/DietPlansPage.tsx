import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DietPlan from '../components/DietPlan';

const DietPlansPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Personalized Diet Plans
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Nutrition recommendations tailored to your PCOS status
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Dietary Needs with PCOS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600 mb-4">
                  Polycystic Ovary Syndrome (PCOS) often involves insulin resistance, which affects how your 
                  body processes carbohydrates and sugars. A targeted diet approach can help manage PCOS 
                  symptoms and improve overall health.
                </p>
                <p className="text-gray-600 mb-4">
                  Our PCOS-friendly diet plans focus on:
                </p>
                <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-1">
                  <li>Balancing blood sugar levels with low glycemic index foods</li>
                  <li>Reducing inflammation with antioxidant-rich foods</li>
                  <li>Supporting hormone balance with essential nutrients</li>
                  <li>Managing weight through sustainable, nutritious choices</li>
                </ul>
                <p className="text-gray-600">
                  These carefully designed meal plans are based on scientific research and nutritional 
                  best practices for women with PCOS.
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-5">
                <h3 className="text-xl font-semibold text-purple-900 mb-3">Key Dietary Principles for PCOS</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-200 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-purple-700 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900">Focus on Low GI Carbohydrates</h4>
                      <p className="text-sm text-purple-800 mt-1">
                        Choose complex carbs like whole grains, legumes, and vegetables that 
                        release glucose slowly into your bloodstream.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-200 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-purple-700 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900">Include Anti-inflammatory Foods</h4>
                      <p className="text-sm text-purple-800 mt-1">
                        Incorporate foods rich in omega-3 fatty acids, antioxidants, and 
                        anti-inflammatory compounds like fatty fish, berries, and leafy greens.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-200 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-purple-700 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900">Prioritize Lean Proteins</h4>
                      <p className="text-sm text-purple-800 mt-1">
                        Include adequate protein from sources like poultry, fish, tofu, eggs, 
                        and legumes to help stabilize blood sugar and support satiety.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-200 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-purple-700 text-sm font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900">Limit Processed Foods</h4>
                      <p className="text-sm text-purple-800 mt-1">
                        Reduce intake of processed foods, refined sugars, and artificial additives 
                        that can worsen inflammation and insulin resistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Your Personalized Meal Plan</h2>
              <p className="mt-2 text-gray-500">
                Based on your PCOS detection results, we've created a tailored nutrition plan to help manage your symptoms
              </p>
            </div>
            <DietPlan type="pcos" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DietPlansPage;