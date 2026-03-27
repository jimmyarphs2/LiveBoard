import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20'
      };
    }
    if (customPrice < suggestions.safe * 0.8) {
      return {
        type: 'info',
        message: 'You are leaving money on the table! Your stats support a higher price point.',
        icon: TrendingUp,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
      };
    }
    return {
      type: 'success',
      message: 'Your price is well-optimized for your current reach and niche.',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    };
  };

  const feedback = getFeedback();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-heading font-black flex items-center gap-3 tracking-tighter text-white">
            <Sparkles className="w-7 h-7 text-primary animate-pulse" />
            AI Pricing Engine
          </h3>
          <p className="text-white/40 font-black text-[9px] uppercase tracking-[0.3em]">Real-time market analysis for maximum yield</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="rounded-full bg-primary/10 text-primary border-primary/20 px-4 py-1 font-black text-[9px] uppercase tracking-[0.3em] glow-primary">
            Live Analysis
          </Badge>
          <InfoTooltip 
            content="Our AI analyzes thousands of successful live campaigns to suggest the most profitable price for your specific stats." 
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl border border-white/5 shadow-2xl"></div>
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
        <Card className="fintech-card rounded-2xl border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl shadow-2xl">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-lg font-black font-heading flex items-center gap-2 tracking-tight">
              <BarChart3 className="w-5 h-5 text-primary" />
              Earnings Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-black">Lives per week</Label>
                <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-xl border border-white/5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-white/10 text-white"
                    onClick={() => setFrequency(Math.max(1, frequency - 1))}
                  >-</Button>
                  <span className="font-black text-base text-white min-w-[1.25rem] text-center">{frequency}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-white/10 text-white"
                    onClick={() => setFrequency(frequency + 1)}
                  >+</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-black">Slots per live</Label>
                <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-xl border border-white/5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-white/10 text-white"
                    onClick={() => setSlotsPerLive(Math.max(1, slotsPerLive - 1))}
                  >-</Button>
                  <span className="font-black text-base text-white min-w-[1.25rem] text-center">{slotsPerLive}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg hover:bg-white/10 text-white"
                    onClick={() => setSlotsPerLive(slotsPerLive + 1)}
                  >+</Button>
                </div>
              </div>
            </div>

            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontWeight: 800, style: { textTransform: 'uppercase', letterSpacing: '0.1em' } }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fontWeight: 800 }}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff', fontWeight: 800, fontSize: '12px' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', fontWeight: 800, textTransform: 'uppercase', fontSize: '9px', marginBottom: '4px' }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {projectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 1 ? '#3b82f6' : 'rgba(255,255,255,0.1)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-primary/10">
              <div>
                <p className="text-[9px] text-primary font-black uppercase tracking-[0.3em] mb-1">Estimated Monthly Revenue</p>
                <p className="text-2xl font-black text-white tracking-tighter">${projectionData[1].amount.toLocaleString()}</p>
              </div>
              <div className="bg-primary/20 p-2.5 rounded-xl shadow-inner border border-primary/20">
                <ArrowUpRight className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fintech-card rounded-2xl border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl shadow-2xl">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-lg font-black font-heading flex items-center gap-2 tracking-tight">
              <DollarSign className="w-5 h-5 text-primary" />
              Set Your Price
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-primary" />
                </div>
                <Input 
                  type="number" 
                  value={customPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCustomPrice(val);
                    onPriceSelect(val);
                  }}
                  className="pl-14 h-12 text-xl font-black bg-white/5 border-white/10 focus-visible:ring-primary/50 rounded-xl tracking-tighter shadow-inner"
                  placeholder="0.00"
                />
              </div>

              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-2xl border flex gap-4 shadow-2xl ${feedback.bg} ${feedback.border}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner bg-white/5 ${feedback.color}`}>
                      <feedback.icon className="w-5 h-5" />
                    </div>
                    <p className="text-[13px] text-white/70 leading-relaxed font-medium">{feedback.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">AI Insights & Strategy</p>
                <ul className="space-y-3">
                  {suggestions?.tips?.map((tip: string, i: number) => (
                    <li key={i} className="text-[13px] text-white/60 flex gap-3 group">
                      <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-medium leading-relaxed">{tip}</span>
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
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 glow-emerald',
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400 glow-primary',
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400 glow-purple',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400 glow-amber',
  };

  return (
    <button 
      onClick={onClick}
      className={`p-5 rounded-2xl border text-left transition-all duration-700 hover:scale-[1.02] active:scale-[0.98] shadow-2xl relative overflow-hidden group ${
        active 
          ? `${colorClasses[color as keyof typeof colorClasses]} border-current ring-2 ring-current/10` 
          : 'bg-[#0f172a]/40 border-white/10 text-white/40 hover:border-white/20 backdrop-blur-3xl'
      }`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity group-hover:scale-125 duration-700">
        <Icon className="w-16 h-16" />
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-inner transition-colors duration-500 ${active ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">{title}</span>
      </div>
      <div className="text-2xl font-heading font-black text-white mb-1 tracking-tighter relative z-10">${price}</div>
      <p className="text-[9px] leading-tight font-black uppercase tracking-[0.4em] opacity-40 relative z-10">{description}</p>
    </button>
  );
}
