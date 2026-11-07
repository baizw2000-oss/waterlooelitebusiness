import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Merchant,
  HelpPost,
  ChamberEvent,
  UserProfile,
  PointsTransaction,
  HelpOffer,
} from '../types';
import {
  INITIAL_MERCHANTS,
  INITIAL_HELP_POSTS,
  INITIAL_EVENTS,
  INITIAL_TRANSACTIONS,
} from '../data/mockData';

const LOCAL_STORAGE_KEYS = {
  MERCHANTS: 'weba_merchants_clean_v3',
  POSTS: 'weba_posts_clean_v3',
  EVENTS: 'weba_events_clean_v3',
  USER: 'weba_user_clean_v3',
  TX: 'weba_transactions_clean_v3',
};

// Immediate cleanup of legacy mock caches
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    [
      'weba_merchants_cache_v2',
      'weba_posts_cache_v2',
      'weba_events_cache_v2',
      'weba_user_cache_v2',
      'weba_transactions_cache_v2',
      'weba_merchants_cache',
      'weba_posts_cache'
    ].forEach((k) => localStorage.removeItem(k));
  }
} catch (e) {
  // Ignore storage error
}

// 1. Initial Migration & Seed Function (Pure Production Mode: No Mock Data)
export async function seedFirestoreIfEmpty() {
  console.log('[Firestore] Applet running in pristine real-client testing mode (all mock data removed).');
}

// Helper to ensure merchants have clean user-defined websites and no legacy hardcoded placeholders
function sanitizeMerchant(m: Merchant): Merchant {
  let website = (m.website || '').trim();
  let description = m.description || '';

  // Clean up legacy hardcoded placeholder 'https://waterloobusiness.ca'
  if (website === 'https://waterloobusiness.ca') {
    const urlMatch = description.match(/(https?:\/\/[^\s\n\r]+)/i);
    if (urlMatch) {
      website = urlMatch[0];
      description = description.replace(urlMatch[0], '').trim();
    } else {
      website = '';
    }
  }

  // Deduce entityType: company (企业Logo) vs individual (个人照片)
  const isIndividual = 
    m.entityType === 'individual' ||
    (m.name && m.repName && m.name.trim() === m.repName.trim()) ||
    m.name?.includes('个人') ||
    m.name?.includes('白政玮') ||
    m.repTitle?.includes('经纪') ||
    m.repTitle?.includes('独立顾问');

  const entityType: 'company' | 'individual' = m.entityType || (isIndividual ? 'individual' : 'company');

  return {
    ...m,
    website,
    description,
    entityType,
    logo: m.logo || (entityType === 'individual' ? '👤' : '🏢'),
    auditStatus: m.auditStatus || (m.verified ? 'APPROVED' : 'PENDING_APPROVAL'),
  };
}

// 2. Real-time Merchants Subscription with LocalStorage dual cache
export function subscribeMerchants(onUpdate: (merchants: Merchant[]) => void) {
  // First load from LocalStorage cache immediately to eliminate flash of old state
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.MERCHANTS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onUpdate(parsed.map(sanitizeMerchant));
      }
    }
  } catch (e) {
    // Ignore localStorage parse error
  }

  const path = 'merchants';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        // Check localStorage before falling back
        try {
          const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.MERCHANTS);
          if (cached) {
            onUpdate(JSON.parse(cached).map(sanitizeMerchant));
            return;
          }
        } catch (e) {}
        onUpdate(INITIAL_MERCHANTS.map((m) => ({ ...m, auditStatus: 'APPROVED' })));
        return;
      }
      const list: Merchant[] = snapshot.docs.map((d) => {
        const data = d.data() as Merchant;
        return sanitizeMerchant({
          ...data,
          id: d.id,
        });
      });
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.MERCHANTS, JSON.stringify(list));
      } catch (e) {}
      onUpdate(list);
    },
    (error) => {
      console.warn('Firestore merchants subscription failed, using cached state:', error);
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.MERCHANTS);
        if (cached) {
          onUpdate(JSON.parse(cached).map(sanitizeMerchant));
          return;
        }
      } catch (e) {}
      onUpdate(INITIAL_MERCHANTS.map((m) => ({ ...m, auditStatus: 'APPROVED' })));
    }
  );
}

// 3. Real-time Help Posts Subscription
export function subscribeHelpPosts(onUpdate: (posts: HelpPost[]) => void) {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.POSTS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) onUpdate(parsed);
    }
  } catch (e) {}

  const path = 'help_posts';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        try {
          const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.POSTS);
          if (cached) {
            onUpdate(JSON.parse(cached));
            return;
          }
        } catch (e) {}
        onUpdate(INITIAL_HELP_POSTS);
        return;
      }
      const list: HelpPost[] = snapshot.docs.map((d) => ({
        ...(d.data() as HelpPost),
        id: d.id,
        offers: d.data().offers || [],
      }));
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.POSTS, JSON.stringify(list));
      } catch (e) {}
      onUpdate(list);
    },
    (error) => {
      console.warn('Firestore help posts subscription failed, using cached state:', error);
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.POSTS);
        if (cached) {
          onUpdate(JSON.parse(cached));
          return;
        }
      } catch (e) {}
      onUpdate(INITIAL_HELP_POSTS);
    }
  );
}

// 4. Real-time Events Subscription
export function subscribeEvents(onUpdate: (events: ChamberEvent[]) => void) {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.EVENTS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) onUpdate(parsed);
    }
  } catch (e) {}

  const path = 'events';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        try {
          const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.EVENTS);
          if (cached) {
            onUpdate(JSON.parse(cached));
            return;
          }
        } catch (e) {}
        onUpdate(INITIAL_EVENTS);
        return;
      }
      const list: ChamberEvent[] = snapshot.docs.map((d) => ({
        ...(d.data() as ChamberEvent),
        id: d.id,
      }));
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.EVENTS, JSON.stringify(list));
      } catch (e) {}
      onUpdate(list);
    },
    (error) => {
      console.warn('Firestore events subscription failed, using cached state:', error);
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.EVENTS);
        if (cached) {
          onUpdate(JSON.parse(cached));
          return;
        }
      } catch (e) {}
      onUpdate(INITIAL_EVENTS);
    }
  );
}

// 5. Merchant Operations: Add / Apply
export async function addMerchantToFirestore(merchant: Merchant): Promise<void> {
  const merchantId = String(merchant.id);
  const path = `merchants/${merchantId}`;
  const payload = {
    ...merchant,
    id: merchantId,
    auditStatus: merchant.auditStatus || 'PENDING_APPROVAL',
    appliedAt: merchant.appliedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  // Update local cache synchronously
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.MERCHANTS);
    const list: Merchant[] = cached ? JSON.parse(cached) : [...INITIAL_MERCHANTS];
    const filtered = list.filter((m) => String(m.id) !== merchantId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.MERCHANTS, JSON.stringify([payload, ...filtered]));
  } catch (e) {}

  try {
    await setDoc(doc(db, 'merchants', merchantId), payload);
  } catch (error) {
    console.warn('Could not write merchant to cloud Firestore (local cache retained):', error);
  }
}

// 6. Admin Approval Operations
export async function approveMerchantInFirestore(merchantId: string | number, reviewerName: string): Promise<void> {
  const mId = String(merchantId);
  const updates = {
    auditStatus: 'APPROVED' as const,
    verified: true,
    reviewedBy: reviewerName,
    reviewedAt: new Date().toISOString(),
  };

  // Update local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.MERCHANTS);
    if (cached) {
      const list: Merchant[] = JSON.parse(cached);
      const updatedList = list.map((m) =>
        String(m.id) === mId ? { ...m, ...updates } : m
      );
      localStorage.setItem(LOCAL_STORAGE_KEYS.MERCHANTS, JSON.stringify(updatedList));
    }
  } catch (e) {}

  try {
    await updateDoc(doc(db, 'merchants', mId), updates);
  } catch (error) {
    console.warn('Firestore updateDoc failed, local cache updated:', error);
  }
}

export async function rejectMerchantInFirestore(merchantId: string | number, reviewerName: string, reason?: string): Promise<void> {
  const mId = String(merchantId);
  const updates = {
    auditStatus: 'REJECTED' as const,
    reviewedBy: reviewerName,
    reviewedAt: new Date().toISOString(),
    reviewNotes: reason || '请补充滑铁卢地区实体经营资质或执照编号后再次提交',
  };

  // Update local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.MERCHANTS);
    if (cached) {
      const list: Merchant[] = JSON.parse(cached);
      const updatedList = list.map((m) =>
        String(m.id) === mId ? { ...m, ...updates } : m
      );
      localStorage.setItem(LOCAL_STORAGE_KEYS.MERCHANTS, JSON.stringify(updatedList));
    }
  } catch (e) {}

  try {
    await updateDoc(doc(db, 'merchants', mId), updates);
  } catch (error) {
    console.warn('Firestore updateDoc failed, local cache updated:', error);
  }
}

// 6b. Admin Merchant Management: Update / Edit Merchant Details
export async function updateMerchantInFirestore(
  merchantId: string | number,
  updates: Partial<Merchant>
): Promise<void> {
  const mId = String(merchantId);
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Update local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.MERCHANTS);
    if (cached) {
      const list: Merchant[] = JSON.parse(cached);
      const updatedList = list.map((m) =>
        String(m.id) === mId ? { ...m, ...payload } : m
      );
      localStorage.setItem(LOCAL_STORAGE_KEYS.MERCHANTS, JSON.stringify(updatedList));
    }
  } catch (e) {}

  try {
    await updateDoc(doc(db, 'merchants', mId), payload);
  } catch (error) {
    console.warn('Firestore updateMerchant failed, local cache updated:', error);
  }
}

// 6c. Admin Merchant Management: Delist / Suspend Merchant (下架/风险处置)
export async function delistMerchantInFirestore(
  merchantId: string | number,
  reason: string,
  reviewerName: string
): Promise<void> {
  const mId = String(merchantId);
  const updates = {
    auditStatus: 'SUSPENDED' as const,
    isDelisted: true,
    delistReason: reason || '存在严重会员投诉或失信舆情，经商会秘书处核实暂予下架公示',
    delistedAt: new Date().toISOString(),
    delistedBy: reviewerName || '商会纪律与公信委员会',
    verified: false,
  };

  // Update local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.MERCHANTS);
    if (cached) {
      const list: Merchant[] = JSON.parse(cached);
      const updatedList = list.map((m) =>
        String(m.id) === mId ? { ...m, ...updates } : m
      );
      localStorage.setItem(LOCAL_STORAGE_KEYS.MERCHANTS, JSON.stringify(updatedList));
    }
  } catch (e) {}

  try {
    await updateDoc(doc(db, 'merchants', mId), updates);
  } catch (error) {
    console.warn('Firestore delistMerchant failed, local cache updated:', error);
  }
}

// 6d. Admin Merchant Management: Relist / Restore Merchant (恢复上架)
export async function relistMerchantInFirestore(
  merchantId: string | number,
  reviewerName: string
): Promise<void> {
  const mId = String(merchantId);
  const updates = {
    auditStatus: 'APPROVED' as const,
    isDelisted: false,
    delistReason: '',
    delistedAt: '',
    delistedBy: '',
    reviewedBy: reviewerName,
    reviewedAt: new Date().toISOString(),
    verified: true,
  };

  // Update local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.MERCHANTS);
    if (cached) {
      const list: Merchant[] = JSON.parse(cached);
      const updatedList = list.map((m) =>
        String(m.id) === mId ? { ...m, ...updates } : m
      );
      localStorage.setItem(LOCAL_STORAGE_KEYS.MERCHANTS, JSON.stringify(updatedList));
    }
  } catch (e) {}

  try {
    await updateDoc(doc(db, 'merchants', mId), updates);
  } catch (error) {
    console.warn('Firestore relistMerchant failed, local cache updated:', error);
  }
}

// 6e. Admin Merchant Management: Permanently Delete Merchant (彻底删除)
export async function deleteMerchantFromFirestore(merchantId: string | number): Promise<void> {
  const mId = String(merchantId);

  // Update local cache
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.MERCHANTS);
    if (cached) {
      const list: Merchant[] = JSON.parse(cached);
      const filtered = list.filter((m) => String(m.id) !== mId);
      localStorage.setItem(LOCAL_STORAGE_KEYS.MERCHANTS, JSON.stringify(filtered));
    }
  } catch (e) {}

  try {
    await deleteDoc(doc(db, 'merchants', mId));
  } catch (error) {
    console.warn('Firestore deleteDoc failed, local cache updated:', error);
  }
}

// 7. Help Post Operations
export async function addHelpPostToFirestore(post: HelpPost): Promise<void> {
  const postId = String(post.id);
  const payload = {
    ...post,
    id: postId,
    createdAt: new Date().toISOString(),
    offers: post.offers || [],
  };

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.POSTS);
    const list: HelpPost[] = cached ? JSON.parse(cached) : [...INITIAL_HELP_POSTS];
    const filtered = list.filter((p) => String(p.id) !== postId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.POSTS, JSON.stringify([payload, ...filtered]));
  } catch (e) {}

  try {
    await setDoc(doc(db, 'help_posts', postId), payload);
  } catch (error) {
    console.warn('Could not write help post to Firestore:', error);
  }
}

export async function addOfferToHelpPost(postId: string | number, offer: HelpOffer): Promise<void> {
  const pId = String(postId);
  try {
    const postRef = doc(db, 'help_posts', pId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const data = postSnap.data() as HelpPost;
      const currentOffers = data.offers || [];
      const updatedOffers = [...currentOffers, offer];
      await updateDoc(postRef, {
        offers: updatedOffers,
        responsesCount: updatedOffers.length,
        status: data.status === '待对接' ? '对接中' : data.status,
      });
    }
  } catch (error) {
    console.warn('Error adding offer:', error);
  }
}

export async function acceptOfferInFirestore(postId: string | number, offerId: string | number): Promise<void> {
  const pId = String(postId);
  try {
    const postRef = doc(db, 'help_posts', pId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const data = postSnap.data() as HelpPost;
      const currentOffers = data.offers || [];
      const updatedOffers = currentOffers.map((o) =>
        String(o.id) === String(offerId) ? { ...o, accepted: true } : o
      );
      await updateDoc(postRef, {
        offers: updatedOffers,
        status: '已圆满解决',
      });
    }
  } catch (error) {
    console.warn('Error accepting offer:', error);
  }
}

// 8. Event RSVP & Check-in
export async function rsvpEventInFirestore(eventId: string | number, user: UserProfile): Promise<void> {
  const eId = String(eventId);
  try {
    const eventRef = doc(db, 'events', eId);
    const eventSnap = await getDoc(eventRef);
    if (eventSnap.exists()) {
      const count = (eventSnap.data().registeredCount || 0) + 1;
      await updateDoc(eventRef, { registeredCount: count });
    }

    const userRef = doc(db, 'users', user.uid);
    const currentRegistered = user.registeredEventIds || [];
    if (!currentRegistered.map(String).includes(eId)) {
      await updateDoc(userRef, {
        registeredEventIds: [...currentRegistered, eId],
      });
    }
  } catch (error) {
    console.warn('Error in rsvpEventInFirestore:', error);
  }
}

export async function checkInEventInFirestore(eventId: string | number, user: UserProfile, pointsReward: number): Promise<void> {
  const eId = String(eventId);
  try {
    const userRef = doc(db, 'users', user.uid);
    const currentChecked = user.checkedInEventIds || [];
    if (!currentChecked.map(String).includes(eId)) {
      await updateDoc(userRef, {
        checkedInEventIds: [...currentChecked, eId],
        points: (user.points || 0) + pointsReward,
      });

      await addPointsTransactionToFirestore({
        id: `tx-${Date.now()}`,
        userId: user.uid,
        title: '出席商会线下活动现场扫码签到打卡',
        change: pointsReward,
        date: '刚刚',
        type: 'EVENT_ATTEND',
      });
    }
  } catch (error) {
    console.warn('Error in checkInEventInFirestore:', error);
  }
}

// 9. User Profile Operations
export async function saveUserProfileToFirestore(profile: UserProfile): Promise<void> {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(profile));
  } catch (e) {}

  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn('Error saving user profile to Firestore:', error);
  }
}

export async function fetchUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (error) {
    console.warn('Error fetching user profile from Firestore, checking localStorage:', error);
  }

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  return null;
}

// 10. Points Transaction Operations
export async function addPointsTransactionToFirestore(tx: PointsTransaction): Promise<void> {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEYS.TX);
    const list: PointsTransaction[] = cached ? JSON.parse(cached) : [...INITIAL_TRANSACTIONS];
    localStorage.setItem(LOCAL_STORAGE_KEYS.TX, JSON.stringify([tx, ...list]));
  } catch (e) {}

  try {
    await setDoc(doc(db, 'points_transactions', tx.id), {
      ...tx,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Could not save points transaction:', error);
  }
}
