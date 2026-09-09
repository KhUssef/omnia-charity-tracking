export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'EMPLOYEE';
  phone?: string;
  isActive?: boolean;
}

export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Family {
  id: string;
  lastName: string;
  phone?: string;
  address: string;
  numberOfMembers: number;
  containsDisabledMember: boolean;
  containsElderlyMember: boolean;
  containspupilMember: boolean;
  notes?: string;
  location?: Location;
  visits?: Visit[];
  vulnerabilityScore?: number;
}

export interface Visit {
  id: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  isCompleted: boolean;
  notes?: string;
  families?: Family[];
  users?: User[];
  aidDistributions?: AidDistribution[];
}

export const AidType = {
  FOOD: 'FOOD',
  MEDICINE: 'MEDICINE',
  FINANCIAL: 'FINANCIAL',
  SOCIAL: 'SOCIAL',
  OTHER: 'OTHER',
} as const;
export type AidType = (typeof AidType)[keyof typeof AidType];

export interface Aid {
  id: string;
  name: string;
  type: AidType;
  description?: string;
}

export interface AidDistribution {
  id: string;
  quantity: number;
  unit?: string;
  date?: string;
  createdAt?: string;
  notes?: string;
  aid?: Aid;
  visit?: Visit;
  family?: Family;
}

export interface News {
  id: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalFamilies: number;
  totalVisits: number;
  totalAidDistributions: number;
  activeVisits: number;
  familiesByAidType: Record<string, number>;
  monthlyVisits: { month: string; count: number }[];
  recentDistributions: AidDistribution[];
}

export interface TraceabilityNode {
  id: string;
  type: 'aid' | 'distribution' | 'visit' | 'family';
  name: string;
  date?: string;
  details?: string;
  children?: TraceabilityNode[];
}

export interface VulnerabilityScore {
  familyId: string;
  familyName: string;
  score: number;
  level: 'critical' | 'high' | 'medium' | 'low';
  factors: { label: string; impact: number }[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface VisitPlan {
  familyId: string;
  familyName: string;
  address: string;
  latitude: number;
  longitude: number;
  priority: number;
  distance?: number;
}
