import React from 'react';
import { MessageCircle, Users, BarChart3, Shield, Zap, Globe } from 'lucide-react';
import Footer from '../common/Footer';

const Features = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Real-time Messaging',
      description: 'Instant messaging with typing indicators and message status updates for seamless communication.'
    },
    {
      icon: Users,
      title: 'Multi-user Support',
      description: 'Support multiple agents and customers simultaneously with intelligent routing and queue management.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track performance metrics, response times, and customer satisfaction with detailed analytics.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'End-to-end encryption, secure data storage, and compliance with industry standards.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed with instant message delivery and minimal latency worldwide.'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Serve customers worldwide with multi-language support and global infrastructure.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Perfect Customer Support
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive live chat platform provides all the tools you need to deliver 
            exceptional customer experiences and drive business growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-6">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      
    </section>

  );
};

export default Features;