import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { venueApi } from '@/lib/api';
import type { VenueSummary } from '@/types/venue';
import { Link } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<VenueSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVenues() {
      try {
        const response = await venueApi.getVenues();
        setVenues(response.content);
      } catch (error) {
        console.error('Failed to fetch venues', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVenues();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading venues...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground">Manage event venues and physical spaces.</p>
        </div>
        <Link to="/admin/venues/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Venue
          </Button>
        </Link>
      </div>

      {venues.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent>
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No venues found</h3>
            <p className="text-muted-foreground mb-6">Create your first venue to start hosting events with seat selection.</p>
            <Link to="/admin/venues/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Venue
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <Card key={venue.id}>
              <CardHeader>
                <CardTitle>{venue.name}</CardTitle>
                <CardDescription>Capacity: {venue.capacity}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  Type: {venue.type || 'Standard'}
                </div>
                <Button variant="outline" className="w-full">
                  Edit Venue
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
