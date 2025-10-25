"use client";

import {
  createExperience,
  deleteExperience,
  updateExperience,
} from "@/app/actions/experiences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

type Experience = {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
  order: number;
};

export default function ExperiencePanel() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(
    null
  );
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    setIsLoading(true);
    setFormError("");
    try {
      const response = await fetch("/api/experiences");
      if (!response.ok) throw new Error("Failed to fetch experiences");
      const data = await response.json();
      const arr = Array.isArray(data?.experiences) ? data.experiences : [];
      setExperiences(
        arr.map((e: any) => ({
          id: e._id || e.id,
          title: e.title || "",
          company: e.company || "",
          period: e.period || "",
          description: e.description || "",
          technologies: Array.isArray(e.technologies)
            ? e.technologies
            : typeof e.technologies === "string"
              ? e.technologies.split(",").map((t: string) => t.trim()).filter(Boolean)
              : [],
          order: typeof e.order === "number" ? e.order : 0,
        }))
      );
    } catch (err: any) {
      setFormError(err.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
  };

  const handleCancelEdit = () => {
    setEditingExperience(null);
    setFormError("");
  };

  const handleDeleteExperience = async (id: string) => {
    if (confirm("Are you sure you want to delete this experience?")) {
      try {
        const formData = new FormData();
        formData.append("id", id);

        const result = await deleteExperience(formData);
        if (result.success) {
          fetchExperiences();
        } else {
          setFormError(result.error || "Failed to delete experience");
        }
      } catch (error) {
        console.error("Error deleting experience:", error);
        setFormError("An unexpected error occurred");
      }
    }
  };

  if (isLoading) {
    return <div>Loading experiences...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Experiences</h2>
        <Button
          onClick={() =>
            setEditingExperience({
              id: "",
              title: "",
              company: "",
              period: "",
              description: "",
              technologies: [],
              order: 0,
            } as Experience)
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      </div>

      {formError && (
        <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">
          {formError}
        </div>
      )}

      {editingExperience && (
        <ExperienceForm
          experience={editingExperience}
          onCancel={handleCancelEdit}
          onSuccess={() => {
            setEditingExperience(null);
            fetchExperiences();
          }}
        />
      )}
      {console.log(experiences)}
      <div className="grid grid-cols-1 gap-4">
        {experiences.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            onEdit={handleEditExperience}
            onDelete={handleDeleteExperience}
          />
        ))}
      </div>
    </div>
  );
}

interface ExperienceCardProps {
  experience: Experience;
  onEdit: (experience: Experience) => void;
  onDelete: (id: string) => void;
}

function ExperienceCard({ experience, onEdit, onDelete }: ExperienceCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{experience.title}</CardTitle>
            <div className="text-sm text-gray-500">
              {experience.company} | {experience.period}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(experience)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(experience.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm line-clamp-2">{experience.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {experience.technologies.map((tech, index) => (
              <Badge key={index} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Order: {experience.order}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExperienceFormProps {
  experience: Experience;
  onCancel: () => void;
  onSuccess: () => void;
}

function ExperienceForm({
  experience,
  onCancel,
  onSuccess,
}: ExperienceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setError("");

    startTransition(async () => {
      try {
        let result;
        if (experience.id) {
          formData.append("id", experience.id);
          result = await updateExperience(formData);
        } else {
          result = await createExperience(formData);
        }

        if (result.success) {
          onSuccess();
        } else {
          setError(result.error || "Failed to save experience");
        }
      } catch (error) {
        console.error("Error saving experience:", error);
        setError("An unexpected error occurred");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {experience.id ? "Edit Experience" : "Add New Experience"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-app-error-light text-app-error-text rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={experience.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              defaultValue={experience.company}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Input
              id="period"
              name="period"
              defaultValue={experience.period}
              placeholder="e.g., Jan 2020 - Present"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={experience.description}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies (comma separated)</Label>
            <Input
              id="technologies"
              name="technologies"
              defaultValue={experience.technologies.join(", ")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              defaultValue={experience.order.toString()}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" aria-disabled={isPending}>
              {isPending ? "Saving..." : "Save Experience"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
