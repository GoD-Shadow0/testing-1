"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GestureMapping } from "@/types";
import { Edit3, Trash2, Zap } from "lucide-react";

interface GestureListItemProps {
  mapping: GestureMapping;
  onEdit: (mapping: GestureMapping) => void;
  onDelete: (id: string) => void;
}

export function GestureListItem({ mapping, onEdit, onDelete }: GestureListItemProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-headline text-primary flex items-center">
              <Zap className="w-5 h-5 mr-2 text-accent" />
              {mapping.gestureName}
            </CardTitle>
            <CardDescription className="mt-1">
              Triggers: <span className="font-medium text-foreground">{mapping.action}</span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(mapping)} aria-label="Edit gesture">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => onDelete(mapping.id)} aria-label="Delete gesture">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {mapping.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{mapping.description}</p>
        </CardContent>
      )}
    </Card>
  );
}
