"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Shield,
  Zap,
  BookOpen,
  FileText,
  Brain,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Brain,
    title: "RAG-Powered Answers",
    description:
      "Every response is grounded in real evidence from PubMed, FDA databases, and peer-reviewed journals.",
  },
  {
    icon: FileText,
    title: "Citation Engine",
    description:
      "Every medical claim is backed by verifiable citations with direct links to source publications.",
  },
  {
    icon: Search,
    title: "PubMed Integration",
    description:
      "Search millions of biomedical articles directly. Real-time access to NCBI databases.",
  },
  {
    icon: Shield,
    title: "Evidence Verification",
    description:
      "Distinguishes between evidence, hypothesis, and opinion. Shows confidence scores.",
  },
  {
    icon: Zap,
    title: "AI Gateway Routing",
    description:
      "Multi-model support through Cloudflare AI Gateway. GPT, Claude, Llama — no vendor lock-in.",
  },
  {
    icon: BookOpen,
    title: "Research Dashboard",
    description:
      "Track clinical trials, FDA approvals, drug pipelines, and safety alerts in one place.",
  },
];

const plans = [
  {
    name: "Basic",
    price: 29,
    queries: "1,000",
    features: [
      "1,000 Queries/month",
      "PubMed Search",
      "Citation Viewer",
      "Email Support",
    ],
  },
  {
    name: "Pro",
    price: 99,
    queries: "10,000",
    highlighted: true,
    features: [
      "10,000 Queries/month",
      "Full RAG Pipeline",
      "FDA Alerts",
      "Clinical Trial Tracking",
      "API Access",
      "Priority Support",
    ],
  },
  {
    name: "Elite",
    price: 299,
    queries: "Unlimited",
    features: [
      "Unlimited Queries",
      "Custom Models",
      "Team Workspace",
      "Dedicated Support",
      "Custom Integrations",
      "SLA Guarantee",
    ],
  },
];

export default function LandingPage() {
  const [demoQuery, setDemoQuery] = useState("");
  const [demoResult, setDemoResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDemo() {
    if (!demoQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search/pubmed?q=${encodeURIComponent(demoQuery)}&max=3`
      );
      const data = (await res.json()) as {
        success: boolean;
        data: {
          articles: { title: string; journal: string; pubdate: string; pmid: string }[];
        };
      };
      if (data.success && data.data.articles.length > 0) {
        setDemoResult(
          data.data.articles
            .map(
              (a: { title: string; journal: string; pubdate: string; pmid: string }) =>
                `• ${a.title}\n  ${a.journal} (${a.pubdate}) — PMID: ${a.pmid}`
            )
            .join("\n\n")
        );
      } else {
        setDemoResult("No results found. Try a different medical term.");
      }
    } catch {
      setDemoResult("Search failed. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">OpenClaw</span>
            <Badge variant="secondary" className="text-xs">Medical AI</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200">
            Retrieval-Augmented Generation
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Medical AI That Cites
            <span className="text-emerald-600"> Real Sources</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Research-grounded answers from PubMed, FDA, and ClinicalTrials.gov.
            Every claim backed by verifiable citations. Never fabricated.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8">
                Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="h-12 px-8">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-5 gap-2 text-center text-sm">
            {["Question", "Search Sources", "Retrieve Evidence", "Generate Answer", "Verified + Cited"].map(
              (step, i) => (
                <div key={step} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <span className="text-gray-600 font-medium">{step}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Built for Medical Professionals & Researchers
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              Every feature designed to ensure accuracy, traceability, and compliance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <Card key={f.title} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                    <f.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-sm">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Try It Now — Search PubMed
          </h2>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={demoQuery}
              onChange={(e) => setDemoQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDemo()}
              placeholder="e.g. metformin diabetes treatment efficacy"
              className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Button
              onClick={handleDemo}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 px-6"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
          {demoResult && (
            <Card className="bg-white">
              <CardContent className="pt-6">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {demoResult}
                </pre>
              </CardContent>
            </Card>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {["CRISPR gene therapy", "mRNA vaccine mechanism", "GLP-1 agonist obesity"].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setDemoQuery(q);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Start free. Scale as you grow.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.highlighted ? "border-emerald-500 shadow-lg ring-1 ring-emerald-500" : "border-gray-200"}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/mo</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {plan.queries} queries/month
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button
                      className={`w-full ${plan.highlighted ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-400 mb-6">TRUSTED DATA SOURCES</p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            {[
              "U.S. FDA",
              "PubMed / NLM",
              "ClinicalTrials.gov",
              "NIH",
              "European Medicines Agency",
            ].map((s) => (
              <span key={s} className="font-medium">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500">OpenClaw Medical AI</span>
          </div>
          <p className="text-xs text-gray-400">
            For research purposes only. Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
