import React from 'react';

interface TestimonialCardProps {
  name: string;
  image: string;
  quote: string;
  role: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, image, quote, role }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-purple-500">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <p className="text-gray-600 italic mb-4">"{quote}"</p>
      <div>
        <h4 className="font-semibold text-gray-900">{name}</h4>
        <p className="text-sm text-purple-600">{role}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;