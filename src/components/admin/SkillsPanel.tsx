"use client";

import { createSkill, deleteSkill, updateSkill } from "@/app/actions/skills";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

type Skill = {
  id: string;
  name: string;
  nameFa?: string;
  category: string;
  level: number;
  icon: string;
  order: number;
};

export default function SkillsPanel() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setIsLoading(true);
    setFormError("");
    try {
      const response = await fetch("/api/skills");
      if (!response.ok) throw new Error("Failed to fetch skills");
      const data = await response.json();
      const arr = Array.isArray(data?.skills) ? data.skills : [];
      setSkills(
        arr.map((s: any) => ({
          id: s._id || s.id,
          name: s.name || "",
          nameFa: s.nameFa || "",
          category: s.category || "",
          level: typeof s.level === "number" ? s.level : 50,
          icon: s.icon || "",
          order: typeof s.order === "number" ? s.order : 0,
        }))
      );
    } catch (err: any) {
      setFormError(err.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
  };

  const handleCancelEdit = () => {
    setEditingSkill(null);
    setFormError("");
  };

  const handleDeleteSkill = async (id: string) => {
    if (confirm("Are you sure you want to delete this skill?")) {
      try {
        const formData = new FormData();
        formData.append("id", id);

        const result = await deleteSkill(formData);
        if (result.success) {
          fetchSkills();
        } else {
          setFormError(result.error || "Failed to delete skill");
        }
      } catch (error) {
        console.error("Error deleting skill:", error);
        setFormError("An unexpected error occurred");
      }
    }
  };

  if (isLoading) {
    return <div>Loading skills...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Skills</h2>
        <Button
          onClick={() =>
            setEditingSkill({
              id: "",
              name: "",
              category: "",
              level: 50,
              icon: "",
              order: 0,
            } as Skill)
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </div>

      {formError && (
        <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">
          {formError}
        </div>
      )}

      {editingSkill && (
        <SkillForm
          skill={editingSkill}
          onCancel={handleCancelEdit}
          onSuccess={() => {
            setEditingSkill(null);
            fetchSkills();
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onEdit={handleEditSkill}
            onDelete={handleDeleteSkill}
          />
        ))}
      </div>
    </div>
  );
}

interface SkillCardProps {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (id: string) => void;
}

function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{skill.name}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(skill)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(skill.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Badge>{skill.category}</Badge>
          <div className="flex items-center space-x-2">
            <div className="w-full bg-app-gray-light rounded-full h-2.5">
              <div
                className="bg-app-blue h-2.5 rounded-full"
                style={{ width: `${skill.level}%` }}
              ></div>
            </div>
            <span className="text-sm">{skill.level}%</span>
          </div>
          <div className="flex justify-between text-sm text-app-gray-dark">
            <span>Icon: {skill.icon}</span>
            <span>Order: {skill.order}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SkillFormProps {
  skill: Skill;
  onCancel: () => void;
  onSuccess: () => void;
}

function SkillForm({ skill, onCancel, onSuccess }: SkillFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [level, setLevel] = useState(skill.level);

  const categories = [
    "Frontend",
    "Backend",
    "Database",
    "DevOps",
    "Mobile",
    "Design",
    "Other",
  ];

  const handleSubmit = async (formData: FormData) => {
    setError("");

    formData.set("level", level.toString());

    if (skill.id) {
      formData.append("id", skill.id);
    }

    startTransition(async () => {
      try {
        let result;
        if (skill.id) {
          result = await updateSkill(formData);
        } else {
          result = await createSkill(formData);
        }

        if (result.success) {
          onSuccess();
        } else {
          setError(result.error || "Failed to save skill");
        }
      } catch (error) {
        console.error("Error saving skill:", error);
        setError("An unexpected error occurred");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{skill.id ? "Edit Skill" : "Add New Skill"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-app-error-light text-app-error-text rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={skill.name} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameFa">Name (Persian)</Label>
              <Input id="nameFa" name="nameFa" defaultValue={skill.nameFa} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={skill.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input id="icon" name="icon" defaultValue={skill.icon} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Skill Level: {level}%</Label>
            <Input
              id="level"
              type="range"
              min="0"
              max="100"
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              defaultValue={skill.order.toString()}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              aria-disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Skill"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
