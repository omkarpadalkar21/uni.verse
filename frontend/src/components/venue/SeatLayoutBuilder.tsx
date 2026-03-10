import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SectionLayout } from '@/types/venue';
import { Trash2, Plus } from 'lucide-react';

interface SeatLayoutBuilderProps {
  sections: SectionLayout[];
  onChange: (sections: SectionLayout[]) => void;
}

export function SeatLayoutBuilder({ sections, onChange }: SeatLayoutBuilderProps) {
  const [newSection, setNewSection] = useState<SectionLayout>({
    name: '',
    rows: 1,
    seatsPerRow: 10,
    price: 0
  });

  const handleAddSection = () => {
    if (!newSection.name.trim() || newSection.rows < 1 || newSection.seatsPerRow < 1) return;
    
    onChange([...sections, { ...newSection }]);
    setNewSection({ name: '', rows: 1, seatsPerRow: 10, price: 0 });
  };

  const handleRemoveSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    onChange(newSections);
  };

  const calculateTotalCapacity = () => {
    return sections.reduce((total, section) => total + (section.rows * section.seatsPerRow), 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seat Layout Builder</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total capacity from sections: {calculateTotalCapacity()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label>Section Name</Label>
              <Input 
                placeholder="e.g. VIP, Balcony" 
                value={newSection.name}
                onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rows</Label>
              <Input 
                type="number" 
                min="1"
                value={newSection.rows}
                onChange={(e) => setNewSection({ ...newSection, rows: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Seats / Row</Label>
              <Input 
                type="number" 
                min="1"
                value={newSection.seatsPerRow}
                onChange={(e) => setNewSection({ ...newSection, seatsPerRow: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Price (Optional)</Label>
              <Input 
                type="number" 
                min="0"
                value={newSection.price === undefined ? '' : newSection.price}
                onChange={(e) => setNewSection({ ...newSection, price: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
            <Button onClick={handleAddSection} className="w-full" type="button">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>

          {sections.length > 0 && (
            <div className="mt-6 border rounded-md">
              <div className="grid grid-cols-5 p-3 border-b bg-muted/50 font-medium text-sm">
                <div>Section</div>
                <div>Rows</div>
                <div>Seats/Row</div>
                <div>Capacity</div>
                <div>Actions</div>
              </div>
              <div className="divide-y max-h-[300px] overflow-y-auto">
                {sections.map((section, idx) => (
                  <div key={idx} className="grid grid-cols-5 p-3 items-center text-sm">
                    <div className="font-medium">{section.name}</div>
                    <div>{section.rows}</div>
                    <div>{section.seatsPerRow}</div>
                    <div>{section.rows * section.seatsPerRow}</div>
                    <div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveSection(idx)} className="text-destructive h-8 px-2">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
