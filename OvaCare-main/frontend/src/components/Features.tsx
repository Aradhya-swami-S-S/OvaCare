import React from 'react';
import { Upload, Salad, BarChart, BookOpen } from 'lucide-react';
import FeatureCard from './FeatureCard';

const Features: React.FC = () => {
  const features = [
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Securely upload your scan reports or images for quick and accurate PCOS detection.'
    },
    {
      icon: Salad,
      title: 'Personalized Diet Plans',
      description: 'Get customized diet recommendations based on your specific PCOS diagnosis.'
    },
    {
      icon: BarChart,
      title: 'Progress Tracking',
      description: 'Monitor your health journey with comprehensive tracking tools and visualizations.'
    },
    {
      icon: BookOpen,
      title: 'Educational Resources',
      description: 'Access a wealth of information about PCOS, its symptoms, and management options.'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            How OvaCare Works
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Our comprehensive approach to PCOS detection and management
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;