import { useState } from "react";
import { Loader2, AlertCircle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { clubApi } from "@/lib/api";
import type { ClubDTO, ClubUpdateRequest } from "@/types/club";

interface ClubProfileEditorProps {
  club: ClubDTO;
  slug: string;
  onUpdate: () => void;
}

export function ClubProfileEditor({ club, slug, onUpdate }: ClubProfileEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ClubUpdateRequest>({
    name: club.name,
    description: club.description,
    logoUrl: club.logoUrl,
    socialLinks: {},
  });

  const handleChange = (field: keyof ClubUpdateRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setSuccess(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = "Club name must be at least 3 characters";
    }
    if (!formData.description || formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }
    if (!formData.logoUrl) {
      newErrors.logoUrl = "Logo URL is required";
    } else {
      try {
        new URL(formData.logoUrl);
      } catch {
        newErrors.logoUrl = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await clubApi.updateClub(slug, formData);
      setSuccess(true);
      onUpdate();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Failed to update club.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Club Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-500/10 border-green-500/20 text-green-500">
              <Check className="h-4 w-4" />
              <AlertDescription>Club updated successfully!</AlertDescription>
            </Alert>
          )}

          {/* Club Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Club Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={isLoading}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Logo URL */}
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(e) => handleChange("logoUrl", e.target.value)}
              disabled={isLoading}
              className={errors.logoUrl ? "border-destructive" : ""}
            />
            {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={5}
              disabled={isLoading}
              className={errors.description ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/5000 characters (minimum 50)
            </p>
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
