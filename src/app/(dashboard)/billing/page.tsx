"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap } from "lucide-react";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    period: "month",
    queryLimit: 1000,
    features: [
      "1,000 Queries/month",
      "PubMed Search",
      "Citation Viewer",
      "Email Support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    period: "month",
    queryLimit: 10000,
    highlighted: true,
    features: [
      "10,000 Queries/month",
      "Full RAG Pipeline",
      "FDA Alerts",
      "Clinical Trial Tracking",
      "API Access (10k calls)",
      "Priority Support",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 299,
    period: "month",
    queryLimit: -1,
    features: [
      "Unlimited Queries",
      "Custom Model Selection",
      "Team Workspace (10 seats)",
      "Dedicated Account Manager",
      "Custom Integrations",
      "99.9% SLA",
    ],
  },
];

const addons = [
  { name: "API Access", price: "$0.01/call", description: "Pay per API call" },
  {
    name: "FDA Alert Service",
    price: "$19/mo",
    description: "Real-time FDA approval alerts",
  },
  {
    name: "Research Reports",
    price: "$49/mo",
    description: "Weekly AI-generated research summaries",
  },
];

export default function BillingPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Billing & Subscription
        </h2>
        <p className="text-gray-500 text-sm">
          Manage your plan and view usage.
        </p>
      </div>

      {/* Current Plan */}
      <Card className="mb-8 border-emerald-200 bg-emerald-50/50">
        <CardContent className="py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-gray-900">Current Plan</span>
                <Badge className="bg-emerald-600">Basic</Badge>
              </div>
              <p className="text-sm text-gray-500">
                42 of 1,000 queries used this month
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">$29</p>
              <p className="text-xs text-gray-500">per month</p>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all"
              style={{ width: "4.2%" }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <h3 className="font-semibold text-lg text-gray-900 mb-4">
        Available Plans
      </h3>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.highlighted ? "border-emerald-500 ring-1 ring-emerald-500" : ""}`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-600">Recommended</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle>{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-500 text-sm">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${plan.highlighted ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.id === "basic" ? "Current Plan" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add-ons */}
      <h3 className="font-semibold text-lg text-gray-900 mb-4">Add-ons</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {addons.map((addon) => (
          <Card key={addon.name} className="border-gray-100">
            <CardContent className="py-5">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm">{addon.name}</h4>
                <Badge variant="secondary">{addon.price}</Badge>
              </div>
              <p className="text-xs text-gray-500">{addon.description}</p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                Add
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
