import React from 'react';
import TestimonialCard from './TestimonialCard';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
      quote: 'OvaCare helped me detect my PCOS early and provided a diet plan with Indian foods that has dramatically improved my symptoms. The roti and dal recommendations were perfect!',
      role: 'Software Engineer, 29'
    },
    {
      name: 'Ananya Reddy',
      image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      quote: 'The diet tracker made it so easy to stay on track with my favorite Indian meals. After 6 months of following PCOS-friendly recipes, I feel amazing!',
      role: 'Teacher, 32'
    },
    {
      name: 'Sneha Patel',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      quote: 'I was struggling with unexplained symptoms for years. OvaCare gave me answers and a path forward with personalized Indian diet plans that actually work.',
      role: 'Marketing Manager, 35'
    }
  ];

  return (
    <section className="py-16 bg-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Success Stories
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Hear from women who have taken control of their PCOS journey with OvaCare
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              image={testimonial.image}
              quote={testimonial.quote}
              role={testimonial.role}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;