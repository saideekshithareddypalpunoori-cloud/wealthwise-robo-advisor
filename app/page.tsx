import Link from 'next/link';
import { ArrowRight, TrendingUp, Shield, Target, PieChart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">WealthWise</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Invest Smarter with
          <span className="text-emerald-600"> AI-Powered</span> Advice
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          WealthWise uses Modern Portfolio Theory and machine learning to build and manage
          personalized portfolios that outperform the market by 86% on average.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition"
          >
            Start Investing <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-50 transition"
          >
            Learn More
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-600">+86%</div>
            <div className="text-gray-600 dark:text-gray-400">Better Returns</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-600">-33%</div>
            <div className="text-gray-600 dark:text-gray-400">Lower Volatility</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-600">$3.2K</div>
            <div className="text-gray-600 dark:text-gray-400">Avg. Tax Savings</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-600">50K+</div>
            <div className="text-gray-600 dark:text-gray-400">Active Users</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Why Choose WealthWise?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<PieChart className="h-8 w-8 text-emerald-600" />}
            title="Smart Portfolios"
            description="AI-optimized portfolios based on Nobel Prize-winning Modern Portfolio Theory."
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8 text-emerald-600" />}
            title="Auto Rebalancing"
            description="Automatic portfolio rebalancing when allocations drift from targets."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-emerald-600" />}
            title="Tax Optimization"
            description="Tax-loss harvesting saves you an average of $800/year per $100K."
          />
          <FeatureCard
            icon={<Target className="h-8 w-8 text-emerald-600" />}
            title="Goal Planning"
            description="Track progress toward retirement, house, education, and custom goals."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to grow your wealth?
          </h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Join thousands of investors who trust WealthWise to manage their portfolios intelligently.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center bg-white text-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
          >
            Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">WealthWise</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            &copy; 2024 WealthWise. All rights reserved. Investment advisory services provided for educational purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
