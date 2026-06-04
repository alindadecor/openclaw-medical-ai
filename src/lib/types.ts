export interface User {
  id: string;
  email: string;
  name: string;
  plan: "basic" | "pro" | "elite";
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  confidence?: number;
  created_at: string;
}

export interface Citation {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: string;
  pmid: string;
  url: string;
  snippet: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pubdate: string;
  abstract: string;
  doi?: string;
  url: string;
}

export interface SearchResult {
  articles: PubMedArticle[];
  total: number;
  query: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  queryLimit: number;
  highlighted?: boolean;
}

export interface UsageStats {
  queriesUsed: number;
  queriesLimit: number;
  tokensUsed: number;
  currentPlan: string;
  billingDate: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
