import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SeatLayoutBuilder } from '@/components/venue/SeatLayoutBuilder';
import type { CreateVenueRequest, SectionLayout } from '@/types/venue';
import { venueApi } from '@/lib/api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditVenuePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateVenueRequest>({
    name: '',
    capacity: 0,
    type: 'AUDITORIUM',
    layout: {
      sections: [],
    },
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const venue = await venueApi.getVenueById(id);
        setFormData({
          name: venue.name,
          capacity: venue.capacity,
          type: venue.type || 'AUDITORIUM',
          layout: (venue as any).layout ?? { sections: [] },
        });
      } catch (err) {
        console.error('Failed to fetch venue:', err);
        setError('Failed to load venue details.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleSectionsChange = (sections: SectionLayout[]) => {
    const totalCapacity = sections.reduce(
      (total, section) => total + section.rows * section.seatsPerRow,
      0,
    );
    setFormData((prev) => ({
      ...prev,
      capacity: totalCapacity > 0 ? totalCapacity : prev.capacity,
      layout: { sections },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    try {
      await venueApi.updateVenue(id, formData);
      navigate('/admin/venues');
    } catch (err) {
      console.error('Failed to update venue:', err);
      setError('Failed to update venue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link
        to="/admin/venues"
        className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Venues
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Venue</h1>
        <p className="text-muted-foreground">Update the venue details and seat layout.</p>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-4 py-3">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Venue Information</CardTitle>
            <CardDescription>Basic details about the event venue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Venue Name</Label>
              <Input
                id="name"
                placeholder="Main Auditorium"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Total Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Venue Type</Label>
                <Input
                  id="type"
                  placeholder="e.g. AUDITORIUM, STADIUM, HALL"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <SeatLayoutBuilder sections={formData.layout.sections} onChange={handleSectionsChange} />

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/venues')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
