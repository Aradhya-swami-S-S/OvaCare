import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DetectionUpload from '../components/DetectionUpload';
import EarlyPredictionForm from '../components/EarlyPredictionForm'; // NEW

const DetectionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              PCOS Detection
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Use our AI system for early prediction or upload medical reports for further assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column – Early Prediction */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-purple-700 mb-4">1. Early Prediction</h2>
              <p className="text-gray-600 mb-4">
                Fill in basic medical details to get an AI-powered early prediction of PCOS.
              </p>
              <EarlyPredictionForm />
            </div>

            {/* Right Column – Upload & Analyze */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-purple-700 mb-4">2. Upload Report & Analyze</h2>
              <p className="text-gray-600 mb-4">
                Upload your ultrasound images or medical reports for further analysis using AI.
              </p>
              <DetectionUpload />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important Disclaimer
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      This tool is for informational purposes only and does not provide medical 
                      advice or diagnosis. Always consult with a qualified healthcare provider 
                      regarding any medical conditions or treatments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DetectionPage;
