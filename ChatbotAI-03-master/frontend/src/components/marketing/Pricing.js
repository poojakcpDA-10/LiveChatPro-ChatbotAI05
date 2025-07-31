import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import AuthModal from '../auth/AuthModal.js';
import Footer from '../common/Footer.js';

const Pricing = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: 'per month',
      description: 'Perfect for small businesses getting started with live chat',
      features: [
        'Up to 3 agents',
        'Unlimited conversations',
        'Basic analytics',
        'Email support',
        'Mobile app access',
        'Basic customization'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$79',
      period: 'per month',
      description: 'Ideal for growing businesses that need advanced features',
      features: [
        'Up to 10 agents',
        'Unlimited conversations',
        'Advanced analytics',
        'Priority support',
        'Mobile app access',
        'Full customization',
        'Integrations',
        'File sharing'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: 'per month',
      description: 'For large organizations with complex requirements',
      features: [
        'Unlimited agents',
        'Unlimited conversations',
        'Advanced analytics',
        'Dedicated support',
        'Mobile app access',
        'White-label solution',
        'All integrations',
        'Advanced security',
        'Custom development'
      ],
      popular: false
    }
  ];

  return (
    <>
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your business. All plans include a 14-day free trial 
              with no credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-lg border-2 ${
                plan.popular ? 'border-blue-500' : 'border-gray-200'
              } hover:shadow-xl transition-shadow`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>

                  <button
                    onClick={() => setShowAuthModal(true)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Start Free Trial
                  </button>

                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="register"
        onToggleMode={() => {}}
      />
    </>
  );
};

export default Pricing;