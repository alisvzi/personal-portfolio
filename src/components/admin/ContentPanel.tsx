"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Save } from "lucide-react";
import { updateContent } from "@/app/actions/content";

export default function ContentPanel() {
  const [content, setContent] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/content");
      if (response.ok) {
        const data = await response.json();
        // Filter out MongoDB-specific fields, only keep content fields
        const contentFields = {
          heroTitle: data.heroTitle || '',
          heroSubtitle: data.heroSubtitle || '',
          heroDescription: data.heroDescription || '',
          aboutText: data.aboutText || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || ''
        };
        setContent(contentFields);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContent = async (formData: FormData) => {
    setFormError("");

    startTransition(async () => {
      try {
        const result = await updateContent(formData);
  
        if (result.success) {
          fetchContent();
          setEditingKey(null);
        } else {
          setFormError(result.error || "Failed to update content");
        }
      } catch (error) {
        console.error("Error updating content:", error);
        setFormError("An unexpected error occurred");
      }
    });
  };

  if (isLoading) {
    return <div>Loading content...</div>;
  }

  // Group content by section
  const groupedContent: Record<string, any> = {};
  Object.keys(content).forEach(key => {
    const section = key.split('.')[0];
    if (!groupedContent[section]) {
      groupedContent[section] = {};
    }
    groupedContent[section][key] = content[key];
  });

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Content Management</h2>

      {formError && (
        <div className="p-3 bg-app-error-light text-app-error-text rounded-md text-sm">
          {formError}
        </div>
      )}

      {Object.keys(groupedContent).map(section => (
        <Card key={section} className="mb-6">
          <CardHeader>
            <CardTitle className="capitalize">{section} Section</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.keys(groupedContent[section]).map(key => {
                const value = content[key];
                const isEditing = editingKey === key;
                const isFa = key.endsWith('Fa');
                const baseKey = isFa ? key.slice(0, -2) : key;
                const label = baseKey.split('.').pop() || '';

                return (
                  <div key={key} className="border p-4 rounded-md">
                    {isEditing ? (
                      <form action={handleUpdateContent}>
                        <input type="hidden" name="key" value={key} />
                        <input type="hidden" name="type" value="text" />
                        
                        <div className="space-y-2">
                          <Label htmlFor={key} className="capitalize">
                            {label} {isFa ? "(Persian)" : ""}
                          </Label>
                          
                          {value && value.length > 100 ? (
                            <Textarea
                              id={key}
                              name="value"
                              defaultValue={value}
                              rows={5}
                              className="w-full"
                            />
                          ) : (
                            <Input
                              id={key}
                              name="value"
                              defaultValue={value}
                              className="w-full"
                            />
                          )}
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setEditingKey(null)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isPending} aria-disabled={isPending}>
                            <Save className="mr-2 h-4 w-4" />
                            {isPending ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start">
                          <Label className="capitalize font-medium">
                            {label} {isFa ? "(Persian)" : ""}
                          </Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setEditingKey(key)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-2 text-sm whitespace-pre-wrap">
                          {value}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}