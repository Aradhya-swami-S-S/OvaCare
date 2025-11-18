import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <Features />
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Understanding PCOS
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Polycystic Ovary Syndrome affects millions of women worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                className="rounded-lg shadow-md"
                src="https://my.clevelandclinic.org/-/scassets/images/org/health/articles/8316-polycystic-ovary-syndrome-pcos"
                alt="PCOS - Normal Ovary vs Polycystic Ovary Diagram"
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">What is PCOS?</h3>
              <p className="text-gray-600 mb-4">
                Polycystic Ovary Syndrome (PCOS) is a common hormonal disorder that affects approximately 
                1 in 10 women of reproductive age. It's characterized by irregular periods, excess androgen 
                levels, and polycystic ovaries.
              </p>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Common Symptoms:</h4>
              <ul className="list-disc pl-5 text-gray-600 mb-4 space-y-1">
                <li>Irregular or missed periods</li>
                <li>Excess facial and body hair</li>
                <li>Weight gain and difficulty losing weight</li>
                <li>Acne or oily skin</li>
                <li>Thinning hair or hair loss</li>
                <li>Darkening of skin in neck creases, groin, and underneath breasts</li>
              </ul>
              <p className="text-gray-600">
                Early detection and proper management of PCOS can help prevent long-term complications 
                and improve quality of life. Our platform helps you identify potential PCOS indicators 
                and provides guidance for managing the condition.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Testimonials />
      <section className="py-16 bg-gradient-to-r from-purple-600 to-teal-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">
            Ready to take control of your health?
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-purple-100 mb-8">
            Join thousands of women who have found answers and support through OvaCare.
          </p>
          <div className="inline-flex rounded-md shadow">
            <a
              href="/detection"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Get Started Today
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;