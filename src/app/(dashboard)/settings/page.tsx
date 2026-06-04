"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Plus, Trash2, Key, User, Shield } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  preview: string;
  created: string;
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production",
      preview: "oc_live_****...7f3a",
      created: "2026-01-15",
    },
  ]);
  const [newKeyName, setNewKeyName] = useState("");

  function createKey() {
    if (!newKeyName.trim()) return;
    const key: ApiKey = {
      id: crypto.randomUUID(),
      name: newKeyName,
      preview: `oc_live_****...${Math.random().toString(36).slice(2, 6)}`,
      created: new Date().toISOString().split("T")[0],
    };
    setApiKeys((prev) => [...prev, key]);
    setNewKeyName("");
  }

  function deleteKey(id: string) {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-500 text-sm">
          Manage your account and API keys.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input defaultValue="Demo User" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="user@example.com" disabled />
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{key.name}</p>
                  <p className="text-xs text-gray-500 font-mono">
                    {key.preview}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {key.created}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => deleteKey(key.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex gap-3">
            <Input
              placeholder="Key name (e.g., Development)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createKey()}
            />
            <Button
              onClick={createKey}
              variant="outline"
              className="shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" /> Create Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button variant="outline" size="sm">
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
