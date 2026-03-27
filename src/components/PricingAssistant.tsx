import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  BarChart3, 
  Sparkles, 
  ChevronRight,
  ChevronDown,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { InfoTooltip } from './InfoTooltip';

interface PricingAssistantProps {
  stats: {
    followerCount: number;
    avgViewers: number;
    niche: string;
    country: string;
    adType: string;
  };
  onPriceSelect: (price: number) => void;
  currentPrice?: number;
}

export function PricingAssistant({ stats, onPriceSelect, currentPrice }: PricingAssistantProps) {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [customPrice, setCustomPrice] = useState<number>(currentPrice || 0);
  const [frequency, setFrequency] = useState(3); // Lives per week
  const [slotsPerLive, setSlotsPerLive] = useState(2);
  const [showProjection, setShowProjection] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const data = await geminiService.getPricingSuggestions(stats);
        if (data) setSuggestions(data);
      } catch (error) {
        console.error('Error fetching pricing suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [stats.followerCount, stats.avgViewers, stats.niche, stats.adType]);

  const projectionData = useMemo(() => {
    const price = customPrice || suggestions?.recommended || 0;
    const weekly = price * frequency * slotsPerLive;
    const monthly = weekly * 4.3;
    const yearly = monthly * 12;

    return [
      { name: 'Weekly', amount: Math.round(weekly) },
      { name: 'Monthly', amount: Math.round(monthly) },
      { name: 'Yearly', amount: Math.round(yearly) },
    ];
  }, [customPrice, suggestions, frequency, slotsPerLive]);

  const getFeedback = () => {
    if (!suggestions || !customPrice) return null;
    if (customPrice > suggestions.premium * 1.2) {
      return {
        type: 'warning',
        message: 'This price is significantly higher than market average. It may reduce your booking rate by up to 60%.',
        icon: AlertCircle,
        color: 'text-amber-400'
      };
    }
    if (customPrice < suggestions.safe * 0.8) {
      return {
        type: 'info',
        message: 'You are leaving money on the table! Your stats support a higher price point.',
        icon: TrendingUp,
        color: 'text-blue-400'
      };
    }
    return {
      type: 'success',
      message: 'Your price is well-optimized for your current reach and niche.',
      icon: ShieldCheck,
      color: 'text-emerald-400'
    };
  };

  const feedback = getFeedback();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          AI Pricing Engine
        </h3>
        <InfoTooltip 
          content="Our AI analyzes thousands of successful live campaigns to suggest the most profitable price for your specific stats." 
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-zinc-900 animate-pulse rounded-xl border border-zinc-800"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PricingCard 
            title="Safe Start" 
            price={suggestions?.safe || 0} 
            description="High booking probability"
            icon={ShieldCheck}
            color="emerald"
            onClick={() => { setCustomPrice(suggestions.safe); onPriceSelect(suggestions.safe); }}
            active={customPrice === suggestions?.safe}
          />
          <PricingCard 
            title="Recommended" 
            price={suggestions?.recommended || 0} 
            description="Best balance of ROI"
            icon={Zap}
            color="blue"
            onClick={() => { setCustomPrice(suggestions.recommended); onPriceSelect(suggestions.recommended); }}
            active={customPrice === suggestions?.recommended}
          />
          <PricingCard 
            title="Aggressive" 
            price={suggestions?.aggressive || 0} 
            description="Maximize per-live profit"
            icon={TrendingUp}
            color="purple"
            onClick={() => { setCustomPrice(suggestions.aggressive); onPriceSelect(suggestions.aggressive); }}
            active={customPrice === suggestions?.aggressive}
          />
          <PricingCard 
            title="Premium" 
            price={suggestions?.premium || 0} 
            description="Elite tier positioning"
            icon={DollarSign}
            color="amber"
            onClick={() => { setCustomPrice(suggestions.premium); onPriceSelect(suggestions.premium); }}
            active={customPrice === suggestions?.premium}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-zinc-400" />
              Earnings Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Lives per week</Label>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full border-zinc-700"
                    onClick={() => setFrequency(Math.max(1, frequency - 1))}
                  >-</Button>
                  <span className="font-bold">{frequency}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full border-zinc-700"
                    onClick={() => setFrequency(frequency + 1)}
                  >+</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Slots per live</Label>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full border-zinc-700"
                    onClick={() => setSlotsPerLive(Math.max(1, slotsPerLive - 1))}
                  >-</Button>
                  <span className="font-bold">{slotsPerLive}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full border-zinc-700"
                    onClick={() => setSlotsPerLive(slotsPerLive + 1)}
                  >+</Button>
                </div>
              </div>
            </div>

            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: '#27272a' }}
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#f4f4f5' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {projectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 1 ? '#3b82f6' : '#27272a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">Estimated Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">${projectionData[1].amount}</p>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-zinc-400" />
              Set Your Price
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input 
                  type="number" 
                  value={customPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCustomPrice(val);
                    onPriceSelect(val);
                  }}
                  className="pl-10 h-14 text-xl font-bold bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-xl border flex gap-3 ${
                      feedback.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                      feedback.type === 'info' ? 'bg-blue-500/10 border-blue-500/20' :
                      'bg-emerald-500/10 border-emerald-500/20'
                    }`}
                  >
                    <feedback.icon className={`w-5 h-5 shrink-0 ${feedback.color}`} />
                    <p className="text-sm text-zinc-300 leading-relaxed">{feedback.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">AI Insights</p>
                <ul className="space-y-2">
                  {suggestions?.tips?.map((tip: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-400 flex gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PricingCard({ title, price, description, icon: Icon, color, onClick, active }: any) {
  const colorClasses = {
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
  };

  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
        active 
          ? `${colorClasses[color as keyof typeof colorClasses]} ring-2 ring-offset-2 ring-offset-zinc-950 ring-current` 
          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-widest opacity-60">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">${price}</div>
      <p className="text-[10px] leading-tight opacity-70">{description}</p>
    </button>
  );
}
