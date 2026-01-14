import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventManagementApi, isAuthenticated } from "@/lib/api";
import type {
  EventCreateRequest,
  EventCategory,
} from "@/types/event";

const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "WORKSHOP", label: "Workshop" },
  { value: "SEMINAR", label: "Seminar" },
  { value: "COMPETITION", label: "Competition" },
  { value: "FEST", label: "Fest" },
  { value: "MEETUP", label: "Meetup" },
];

export default function CreateEventPage() {
  const { slug } = useParams<{ slug: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<EventCreateRequest>>({
    title: "",
    slug: "",
    description: "",
    startTime: "",
    endTime: "",
    venueId: 1,
    capacity: 100,
    isPaid: false,
    basePrice: 0,
    registrationMode: "AUTO_APPROVE",
    visibility: "PUBLIC",
    status: "DRAFT",
    bannerUrl: "",
    category: "WORKSHOP",
    tags: [],
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleChange = (field: keyof EventCreateRequest, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }
    if (!formData.description || formData.description.length < 5) {
      newErrors.description = "Description must be at least 5 characters";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = "End time must be after start time";
    }
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    setError(null);

    if (!validateForm() || !slug) return;

    setIsLoading(true);
    try {
      const data: EventCreateRequest = {
        ...(formData as EventCreateRequest),
        clubId: "", // Will be resolved by backend from slug
        status: publish ? "PUBLISHED" : "DRAFT",
      };
      
      await eventManagementApi.createEvent(slug, data);
      setSuccess(true);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Failed to create event.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to sign in to create an event.
            </p>
            <Button asChild>
              <Link to="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full mx-4 bg-card/50 backdrop-blur-lg border-white/10">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Event Created!</h2>
              <p className="text-muted-foreground mb-6">
                Your event has been created successfully.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link to={`/dashboard/club/${slug}`}>Back to Dashboard</Link>
                </Button>
                <Button asChild>
                  <Link to={`/clubs/${slug}`}>View Club</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-2xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" asChild className="mb-6">
            <Link to={`/dashboard/club/${slug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/50 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Create New Event</CardTitle>
              <p className="text-muted-foreground">
                Fill in the details to create a new event for your club.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g., Web Development Workshop"
                    disabled={isLoading}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    placeholder="web-dev-workshop"
                    disabled={isLoading}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date/Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => handleChange("startTime", e.target.value)}
                      disabled={isLoading}
                      className={errors.startTime ? "border-destructive" : ""}
                    />
                    {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => handleChange("endTime", e.target.value)}
                      disabled={isLoading}
                      className={errors.endTime ? "border-destructive" : ""}
                    />
                    {errors.endTime && <p className="text-sm text-destructive">{errors.endTime}</p>}
                  </div>
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleChange("capacity", parseInt(e.target.value))}
                    min={1}
                    disabled={isLoading}
                    className={errors.capacity ? "border-destructive" : ""}
                  />
                  {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
                </div>

                {/* Registration Mode */}
                <div className="space-y-2">
                  <Label>Registration Mode</Label>
                  <Select
                    value={formData.registrationMode}
                    onValueChange={(value) => handleChange("registrationMode", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUTO_APPROVE">Auto Approve</SelectItem>
                      <SelectItem value="MANUAL_APPROVE">Manual Approve</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) => handleChange("visibility", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="CLUB_ONLY">Club Members Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Banner URL */}
                <div className="space-y-2">
                  <Label htmlFor="bannerUrl">Banner URL</Label>
                  <Input
                    id="bannerUrl"
                    value={formData.bannerUrl}
                    onChange={(e) => handleChange("bannerUrl", e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    disabled={isLoading}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe your event..."
                    rows={5}
                    disabled={isLoading}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save as Draft"
                    )}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 glow"
                    disabled={isLoading}
                    onClick={(e) => handleSubmit(e, true)}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Publish Event"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
