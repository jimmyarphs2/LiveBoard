import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc, increment, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export enum InteractionType {
  VIEW = 'view',
  CLICK = 'click',
  BOOKING = 'booking'
}

export interface DiscoverySignals {
  completeness: number;
  responseSpeed: number;
  deliveryRate: number;
  disputeRate: number;
  satisfaction: number;
  views: number;
  clicks: number;
  bookings: number;
  successRate?: number;
  responseTime?: number;
  repeatBookings?: number;
  lastActive?: any;
}

export const logInteraction = async (userId: string, targetId: string, type: InteractionType) => {
  try {
    await addDoc(collection(db, 'discovery_interactions'), {
      userId,
      targetId,
      type,
      timestamp: serverTimestamp()
    });

    // Update aggregate signals on the target profile
    // We assume targetId is either a creatorId or advertiserId
    // First try creators
    const creatorRef = doc(db, 'creators', targetId);
    const creatorSnap = await getDoc(creatorRef);
    
    if (creatorSnap.exists()) {
      const field = type === InteractionType.VIEW ? 'views' : type === InteractionType.CLICK ? 'clicks' : 'bookings';
      await updateDoc(creatorRef, {
        [`discoverySignals.${field}`]: increment(1)
      });
    } else {
      // Try advertisers
      const advertiserRef = doc(db, 'advertisers', targetId);
      const advertiserSnap = await getDoc(advertiserRef);
      if (advertiserSnap.exists()) {
        const field = type === InteractionType.VIEW ? 'views' : type === InteractionType.CLICK ? 'clicks' : 'bookings';
        await updateDoc(advertiserRef, {
          [`discoverySignals.${field}`]: increment(1)
        });
      }
    }
  } catch (error) {
    console.error('Error logging interaction:', error);
  }
};

export const calculateCreatorScore = (creator: any, advertiserProfile: any) => {
  let score = 0;
  const signals = creator.discoverySignals || {};

  // 1. Profile Completeness (0-10)
  score += (signals.completeness || 0.5) * 10;

  // 2. Response Speed (lower is better, max 10)
  // Assume responseSpeed is in minutes. 30 mins or less is perfect.
  const speedScore = Math.max(0, 10 - (signals.responseSpeed || 60) / 30);
  score += speedScore;

  // 3. Delivery Success Rate (0-20)
  score += (signals.deliveryRate || 0.8) * 20;

  // 4. Dispute Rate (lower is better, max 20)
  score += (1 - (signals.disputeRate || 0)) * 20;

  // 5. Advertiser Satisfaction (0-20)
  score += ((signals.satisfaction || 4) / 5) * 20;

  // 6. Personalization
  if (advertiserProfile) {
    // Category Match
    if (creator.niche === advertiserProfile.industry) score += 25;
    
    // Past Categories Match
    if (advertiserProfile.discoverySignals?.pastCategories?.includes(creator.niche)) {
      score += 15;
    }

    // Budget Match
    const minPrice = Math.min(...Object.values(creator.pricing || { d: 50 }) as number[]);
    const budget = advertiserProfile.discoverySignals?.budgetRange;
    if (budget) {
      if (minPrice >= budget.min && minPrice <= budget.max) score += 15;
    }

    // Geography Match
    if (advertiserProfile.targetCountries?.includes(creator.country)) score += 15;
  }

  // 7. Cold Start Logic
  // If few bookings, give a visibility boost
  if ((signals.bookings || 0) < 5) {
    score += 20;
  }

  // 8. Engagement / Learning
  // Click-through rate boost
  const ctr = signals.views > 0 ? signals.clicks / signals.views : 0;
  score += ctr * 50;

  return score;
};

export const calculateAdvertiserScore = (advertiser: any, creatorProfile: any) => {
  let score = 0;
  const signals = advertiser.discoverySignals || {};

  // 1. Industry Match
  if (advertiser.industry === creatorProfile.niche) score += 40;

  // 2. Budget Alignment
  const minCreatorPrice = Math.min(...Object.values(creatorProfile.pricing || { d: 50 }) as number[]);
  const budget = advertiser.discoverySignals?.budgetRange;
  if (budget) {
    if (budget.max >= minCreatorPrice) score += 30;
  }

  // 3. Geographic Alignment
  if (advertiser.targetCountries?.includes(creatorProfile.country)) score += 20;

  // 4. Activity
  score += (signals.bookings || 0) * 2;

  // 5. Cold Start for Advertisers
  if ((signals.bookings || 0) < 3) {
    score += 15;
  }

  return score;
};
