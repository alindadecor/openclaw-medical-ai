"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  Plus,
  Trash2,
  Edit3,
  MessageSquare,
  Clock,
  Loader2,
  Check,
  X,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export default function WorkspacePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectSessions, setProjectSessions] = useState<ChatSession[]>([]);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = (await res.json()) as {
        success: boolean;
        data?: { projects: Project[] };
      };
      if (data.success && data.data) {
        setProjects(data.data.projects);
      }
    } catch {
      // silently fail
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function createProject() {
    if (!newName.trim()) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      const data = (await res.json()) as {
        success: boolean;
        data?: { project: Project };
      };
      if (data.success && data.data) {
        setProjects((prev) => [data.data!.project, ...prev]);
        setNewName("");
        setNewDesc("");
        setCreating(false);
      }
    } catch {
      // silently fail
    }
  }

  async function updateProject() {
    if (!editingId || !editName.trim()) return;
    try {
      await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: editName,
          description: editDesc,
        }),
      });
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, name: editName, description: editDesc }
            : p
        )
      );
      setEditingId(null);
    } catch {
      // silently fail
    }
  }

  async function removeProject(id: string) {
    try {
      await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProject === id) {
        setSelectedProject(null);
        setProjectSessions([]);
      }
    } catch {
      // silently fail
    }
  }

  async function selectProject(id: string) {
    setSelectedProject(id);
    try {
      const res = await fetch(`/api/sessions?projectId=${id}`);
      const data = (await res.json()) as {
        success: boolean;
        data?: { sessions: ChatSession[] };
      };
      if (data.success && data.data) {
        setProjectSessions(data.data.sessions);
      }
    } catch {
      setProjectSessions([]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Saved Workspace
          </h2>
          <p className="text-gray-500 text-sm">
            Organize your research into projects. Save and resume your work
            anytime.
          </p>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setCreating(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {creating && (
        <Card className="mb-6 border-emerald-200">
          <CardContent className="py-4 space-y-3">
            <Input
              placeholder="Project name (e.g., Diabetes Research)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <Textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={createProject}
                disabled={!newName.trim()}
              >
                Create
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCreating(false);
                  setNewName("");
                  setNewDesc("");
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 && !creating ? (
        <div className="text-center py-16 text-gray-400">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-500 mb-2">
            No Projects Yet
          </p>
          <p className="text-sm mb-6">
            Create a project to organize your research and chat history.
          </p>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setCreating(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedProject === project.id
                  ? "border-emerald-500 ring-1 ring-emerald-500"
                  : "border-gray-100"
              }`}
              onClick={() => selectProject(project.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  {editingId === project.id ? (
                    <div
                      className="flex-1 space-y-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description"
                        className="h-8 text-sm"
                      />
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-emerald-600"
                          onClick={updateProject}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                        <CardTitle className="text-base">
                          {project.name}
                        </CardTitle>
                      </div>
                      <div
                        className="flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingId(project.id);
                            setEditName(project.name);
                            setEditDesc(project.description);
                          }}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={() => removeProject(project.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="text-sm text-gray-500 mb-3">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Project sessions */}
      {selectedProject && (
        <div className="mt-8">
          <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Chat Sessions in Project
          </h3>
          {projectSessions.length === 0 ? (
            <Card className="border-gray-100">
              <CardContent className="py-8 text-center text-gray-400 text-sm">
                No chat sessions in this project yet. Start a chat and it will
                appear here.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {projectSessions.map((session) => (
                <Card key={session.id} className="border-gray-100">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{session.title}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(session.created_at).toLocaleDateString()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
