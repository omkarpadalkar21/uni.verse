import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SeatLayoutBuilder } from '@/components/venue/SeatLayoutBuilder';
import type { CreateVenueRequest, SectionLayout } from '@/types/venue';
import { venueApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CreateVenuePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateVenueRequest>({
    name: '',
    capacity: 0,
    type: 'AUDITORIUM',
    layout: {
      sections: []
    }
  });

  const handleSectionsChange = (sections: SectionLayout[]) => {
    const totalCapacity = sections.reduce((total, section) => total + (section.rows * section.seatsPerRow), 0);
    setFormData({
      ...formData,
      capacity: totalCapacity > 0 ? totalCapacity : formData.capacity, // Auto-update capacity if layout provides it
      layout: { sections }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await venueApi.createVenue(formData);
      navigate('/admin/venues');
    } catch (error) {
      console.error('Failed to create venue', error);
      // In a real app we would show a toast error here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center text-sm text-muted-foreground hover:text-foreground cursor-pointer"
           onClick={() => navigate('/admin/venues')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Venues
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Venue</h1>
        <p className="text-muted-foreground">Set up a new physical event location with an optional interactive seat map.</p>
      </div>

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
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
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

        <SeatLayoutBuilder 
          sections={formData.layout.sections} 
          onChange={handleSectionsChange}
        />

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/venues')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Venue'}
          </Button>
        </div>
      </form>
    </div>
  );
}
