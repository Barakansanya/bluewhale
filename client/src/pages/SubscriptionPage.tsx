import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import { 
  Check, 
  Zap, 
  Star, 
  TrendingUp,
  Users,
  Shield,
  Crown,
  Sparkles
} from 'lucide-react';

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Basic',
      price: 0,
      annualPrice: 0,
      description: 'Perfect for getting started',
      badge: null,
      icon: Star,
      color: 'from-slate-600 to-slate-700',
      features: [
        { text: 'Access to JSE Screener', included: true },
        { text: 'Single Watchlist', included: true },
        { text: 'Basic Company Profiles', included: true },
        { text: 'Limited Historical Data', included: true },
        { text: 'Community Support', included: true },
        { text: 'Real-time Data', included: false },
        { text: 'Advanced Analytics', included: false },
        { text: 'AI-Powered Insights', included: false },
        { text: 'Data Export', included: false },
      ],
      cta: 'Current Plan',
      popular: false
    },
    {
      name: 'Pro',
      price: 499,
      annualPrice: 4490, // 10% discount
      description: 'For serious investors',
      badge: 'MOST POPULAR',
      icon: Zap,
      color: 'from-cyan-500 to-blue-600',
      features: [
        { text: 'Everything in Basic', included: true },
        { text: 'Unlimited Watchlists', included: true },
        { text: 'Real-time Market Data', included: true },
        { text: '10 Years Historical Data', included: true },
        { text: 'Advanced Screener Filters', included: true },
        { text: 'AI Sentiment Analysis', included: true },
        { text: 'Report Summarization', included: true },
        { text: 'Data Export (CSV/Excel)', included: true },
        { text: 'Priority Email Support', included: true },
      ],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: null,
      annualPrice: null,
      description: 'For institutions & teams',
      badge: 'CUSTOM',
      icon: Crown,
      color: 'from-purple-500 to-pink-600',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'API Access', included: true },
        { text: 'Team Accounts (Unlimited)', included: true },
        { text: 'White-label Options', included: true },
        { text: 'Custom Integrations', included: true },
        { text: 'Dedicated Account Manager', included: true },
        { text: 'SLA Guarantee', included: true },
        { text: 'Advanced Security', included: true },
        { text: '24/7 Priority Support', included: true },
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const stats = [
    { value: '15+', label: 'JSE Companies', icon: TrendingUp },
    { value: '1000+', label: 'Data Points', icon: Sparkles },
    { value: '24/7', label: 'Market Coverage', icon: Shield },
    { value: '500+', label: 'Active Users', icon: Users }
  ];

  const handleUpgrade = (planName: string) => {
    if (planName === 'Enterprise') {
      window.location.href = 'mailto:sales@bluewhale.co.za?subject=Enterprise Plan Inquiry';
    } else {
      alert(`${planName} payment integration coming soon! (Stripe/Paystack)`);
    }
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">Unlock Premium Features</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Investment Edge</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Get instant access to professional-grade financial analytics and AI-powered insights
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-slate-900 rounded-full p-1 border border-slate-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full transition ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-full transition relative ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                  Save 10%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-slate-900 rounded-2xl border-2 transition-all duration-300 animate-slide-up ${
                  plan.popular 
                    ? 'border-cyan-500 shadow-2xl shadow-cyan-500/20 scale-105' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="mb-6">
                    <div className={`w-14 h-14 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                      <plan.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-slate-400 text-sm">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    {plan.price === null ? (
                      <div>
                        <div className="text-4xl font-bold">Custom</div>
                        <div className="text-slate-400 text-sm">Contact for pricing</div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold">
                            R{billingCycle === 'monthly' ? plan.price : Math.round(plan.annualPrice / 12)}
                          </span>
                          {plan.price > 0 && <span className="text-slate-400 ml-2">/month</span>}
                        </div>
                        {billingCycle === 'annual' && plan.price > 0 && (
                          <div className="text-sm text-slate-400 mt-1">
                            Billed R{plan.annualPrice} annually
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          feature.included 
                            ? 'bg-cyan-500/20 text-cyan-400' 
                            : 'bg-slate-800 text-slate-600'
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className={feature.included ? 'text-slate-200' : 'text-slate-500'}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={plan.name === 'Basic'}
                    className={`w-full py-4 rounded-xl font-semibold transition-all transform ${
                      plan.popular
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-cyan-500/50 hover:scale-105'
                        : plan.name === 'Basic'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-slate-700 text-white hover:scale-105'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 mb-16 border border-slate-800 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-16 animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Can I upgrade or downgrade my plan anytime?',
                  a: 'Yes! You can upgrade to Pro instantly. Downgrades take effect at the end of your billing cycle.'
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, debit cards, and EFT payments through Stripe and Paystack (coming soon).'
                },
                {
                  q: 'Is there a free trial for Pro?',
                  a: 'Yes! New users get a 14-day free trial of Pro features. No credit card required.'
                },
                {
                  q: 'What is your refund policy?',
                  a: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.'
                }
              ].map((faq, index) => (
                <div key={index} className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-slate-400 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise CTA */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 md:p-12 text-center animate-slide-up">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8">
              We work with institutions, hedge funds, and investment teams to build tailored analytics solutions. 
              Get API access, white-label options, and dedicated support.
            </p>
            <button
              onClick={() => handleUpgrade('Enterprise')}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
            >
              <span>Contact Sales Team</span>
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}