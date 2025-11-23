import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileX, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AnalysisResult {
  pcosDetected: boolean | null;
  confidence: number;
  findings: string[];
  recommendations: string[];
  disclaimer: string;
}

interface ApiResponse {
  success: boolean;
  isUltrasound: boolean;
  analysis: AnalysisResult;
  timestamp: string;
  note?: string;
  error?: string;
  details?: string;
}

const DetectionUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError('');
    setResult(null);

    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post<ApiResponse>(
        'http://localhost:5000/analyze-ultrasound',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('API Response:', response.data);
      
      // Validate response structure
      if (response.data && typeof response.data === 'object') {
        // Ensure analysis object has required fields
        if (response.data.analysis) {
          const analysis = response.data.analysis;
          if (!analysis.findings) analysis.findings = [];
          if (!analysis.recommendations) analysis.recommendations = [];
          if (!analysis.disclaimer) analysis.disclaimer = 'This AI analysis is for informational purposes only and should not replace professional medical diagnosis.';
        }
        setResult(response.data);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
        if (err.response.data.details) {
          setError(`${err.response.data.error}: ${err.response.data.details}`);
        }
      } else {
        setError('Failed to analyze image. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  const handleViewDietRecommendations = () => {
    // Store the PCOS detection result in localStorage for the diet page
    if (result?.analysis) {
      localStorage.setItem('pcosDetectionResult', JSON.stringify({
        pcosDetected: result.analysis.pcosDetected,
        confidence: result.analysis.confidence,
        timestamp: new Date().toISOString(),
        findings: result.analysis.findings
      }));
    }
    navigate('/diet-plans');
  };

  try {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">PCOS Detection</h2>
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <FileX className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">Error</p>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}
      
      {/* Results Display */}
      {result?.success && result.analysis ? (
        <div className="mb-6">
          {/* Show notice if vision AI was unavailable */}
          {result.note && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                <p className="text-orange-700 font-medium">Service Notice</p>
              </div>
              <p className="text-orange-600 mt-1">{result.note}</p>
            </div>
          )}
          
          <div className={`p-6 rounded-lg ${
            result.analysis.pcosDetected === null
              ? 'bg-blue-50 border border-blue-200'
              : result.analysis.pcosDetected 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center mb-4">
              {result.analysis.pcosDetected === null ? (
                <AlertCircle className="h-6 w-6 text-blue-500 mr-3" />
              ) : result.analysis.pcosDetected ? (
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              )}
              <h3 className="text-xl font-semibold">
                {result.analysis.pcosDetected === null
                  ? 'Analysis Information'
                  : result.analysis.pcosDetected 
                    ? 'PCOS Indicators Detected' 
                    : 'No PCOS Indicators Detected'}
              </h3>
            </div>
            
            {result.analysis.confidence > 0 && (
              <div className="mb-4">
                <p className={`text-${result.analysis.pcosDetected ? 'red' : 'green'}-700 font-medium mb-2`}>
                  Confidence Level: {result.analysis.confidence}%
                </p>
              </div>
            )}

            {/* Findings */}
            {result.analysis.findings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Key Findings:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.analysis.findings.map((finding, index) => (
                    <li key={index} className="text-gray-700">{finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.analysis.recommendations.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-yellow-800 text-sm">
                <strong>Medical Disclaimer:</strong> {result.analysis.disclaimer}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Upload Another Image
              </button>
              
              {result.analysis.pcosDetected !== null && (
                <button
                  onClick={handleViewDietRecommendations}
                  className={`px-4 py-2 rounded-md text-white transition-colors ${
                    result.analysis.pcosDetected 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  View Diet Recommendations
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">Upload Requirements:</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Upload <strong>ultrasound images only</strong></li>
                <li>• Images should show ovarian or pelvic region</li>
                <li>• Clear, medical-quality images work best</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500 italic">
              Note: This AI analysis is for informational purposes only and does not replace professional medical diagnosis.
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
            <div className="text-center">
              {preview ? (
                <div className="mb-4">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg shadow-md" 
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-600 font-medium">
                    Upload Ultrasound Image
                  </p>
                  <p className="text-sm text-gray-500">
                    Drag and drop or click to select
                  </p>
                </div>
              )}
              
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              
              {!preview && (
                <label
                  htmlFor="file-upload"
                  className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer transition-colors inline-block font-medium"
                >
                  Select Ultrasound Image
                </label>
              )}
              
              {preview && !uploading && !result?.success && (
                <div className="flex justify-center space-x-4">
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer transition-colors inline-block"
                  >
                    Change Image
                  </label>
                  <button
                    onClick={handleUpload}
                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
                  >
                    Analyze with OvaCare
                  </button>
                </div>
              )}
              
              {uploading && (
                <div className="mt-4 flex items-center justify-center">
                  <Loader className="animate-spin h-6 w-6 text-purple-600 mr-2" />
                  <span className="text-gray-600 font-medium">
                    AI is analyzing your ultrasound image...
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
            <p><strong>Supported formats:</strong> JPG, PNG, JPEG</p>
            <p><strong>Maximum file size:</strong> 10MB</p>
            <p><strong>Best results:</strong> Clear ultrasound images showing ovarian region</p>
          </div>
        </>
      )}
      </div>
    );
  } catch (error) {
    console.error('DetectionUpload render error:', error);
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Display Error</h3>
          <p className="text-gray-600 mb-4">There was an error displaying the results.</p>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reset and Try Again
          </button>
        </div>
      </div>
    );
  }
};

export default DetectionUpload;