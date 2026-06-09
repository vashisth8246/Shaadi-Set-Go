import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, IndianRupee, TrendingUp, AlertCircle } from 'lucide-react';
import LuxuryPageHeader from '../components/LuxuryPageHeader';
// pageImages unused

export default function BudgetCalculator() {
  const [totalBudget, setTotalBudget] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [expenses, setExpenses] = useState({
    venue: 0,
    catering: 0,
    photography: 0,
    music: 0,
    decoration: 0,
    invitations: 0,
    other: 0,
  });

  const totalSpent = Object.values(expenses).reduce((sum, val) => sum + val, 0);
  const remaining = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleExpenseChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setExpenses({ ...expenses, [category]: numValue });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-pink/20 to-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <LuxuryPageHeader
          kicker="Budget Atelier"
          title="Plan Spend With Clarity"
          subtitle="A quiet dashboard for shaping the financial rhythm of a considered celebration."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-lg"
          >
            <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-6">
              Wedding Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Budget
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={totalBudget || ''}
                    onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guest Count
                </label>
                <input
                  type="number"
                  value={guestCount || ''}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>
            </div>

            <h3 className="font-playfair text-xl font-bold text-gray-900 mb-4">
              Expense Categories
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(expenses).map((category) => (
                <div key={category}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {category}
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={expenses[category as keyof typeof expenses] || ''}
                      onChange={(e) => handleExpenseChange(category, e.target.value)}
                      placeholder="0"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-gold to-yellow-600 rounded-3xl p-8 text-white shadow-lg">
              <div className="flex items-center mb-4">
                <Calculator className="w-6 h-6 mr-2" />
                <h3 className="font-playfair text-xl font-bold">Budget Summary</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Budget</p>
                  <p className="text-3xl font-bold">
                    ₹{totalBudget.toLocaleString()}
                  </p>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <p className="text-sm opacity-90 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <p className="text-sm opacity-90 mb-1">Remaining</p>
                  <p
                    className={`text-2xl font-bold ${
                      remaining < 0 ? 'text-red-200' : ''
                    }`}
                  >
                    ₹{remaining.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Budget Usage</h4>
                <span className="text-sm font-bold text-gold">
                  {percentageUsed.toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    percentageUsed > 100
                      ? 'bg-red-500'
                      : percentageUsed > 80
                      ? 'bg-yellow-500'
                      : 'bg-gold'
                  }`}
                />
              </div>

              {remaining < 0 && (
                <div className="flex items-start bg-red-50 rounded-lg p-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    You've exceeded your budget by ₹{Math.abs(remaining).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center mb-3">
                <TrendingUp className="w-5 h-5 text-gold mr-2" />
                <h4 className="font-semibold text-gray-900">Cost Per Guest</h4>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                ₹{guestCount > 0 ? Math.round(totalSpent / guestCount).toLocaleString() : 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">per person</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

