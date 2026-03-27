import { Timestamp } from 'firebase/firestore';

export type UserRole = 'creator' | 'advertiser' | 'admin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending';
  createdAt: Timestamp;
  cashBalance: number;
  coinBalance: number;
}

export interface CreatorProfile {
  userId: string;
  tiktokHandle: string;
  followerCount: number;
  avgViewers: number;
  niche: string;
  country: string;
  isEligible: boolean;
  tier: 'starter' | 'growth' | 'premium' | 'elite';
  adTypes: string[];
  pricing: Record<string, number>;
  bio: string;
  trustScore: number;
  growthStage: 'onboarding' | 'active' | 'growth_mode';
  discoverySignals: {
    responseTime: number;
    successRate: number;
    repeatBookings: number;
    lastActive: Timestamp;
  };
}

export interface AdvertiserProfile {
  userId: string;
  brandName: string;
  website: string;
  industry: string;
  targetCountries: string[];
  campaignGoal?: 'awareness' | 'traffic' | 'conversions' | 'app_installs';
}

export interface Booking {
  id?: string;
  advertiserId: string;
  creatorId: string;
  adType: string;
  price: number;
  status: 'pending' | 'accepted' | 'declined' | 'active' | 'proof_submitted' | 'completed' | 'disputed' | 'refunded';
  creativeUrl?: string;
  creativeText?: string;
  proofUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BoxBattleApplication {
  id?: string;
  userId: string;
  tiktokHandle: string;
  followerCount: number;
  giftingLevel: string;
  pastCoins: number;
  leagueLevel: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  aiScore: number;
  aiFeedback: string;
  createdAt: Timestamp;
}

export interface SafetyLog {
  id?: string;
  userId: string;
  content: string;
  contentType: 'text' | 'link' | 'image';
  isSafe: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  createdAt: Timestamp;
}
