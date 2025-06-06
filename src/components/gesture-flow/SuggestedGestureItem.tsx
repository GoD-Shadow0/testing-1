"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AISuggestion, GestureMapping } from "@/types";
import { PlusCircle, Lightbulb } from "lucide-react";

interface SuggestedGestureItemProps {
  suggestion: AISuggestion;
  onAdd: (mapping: Omit<GestureMapping, 'id'>) => void;
  isAdded: boolean;
}

export function SuggestedGestureItem({ suggestion, onAdd, isAdded }: SuggestedGestureItemProps) {
  const handleAdd = () => {
    onAdd({
      gestureName: suggestion.gesture,
      action: suggestion.action,
      description: suggestion.description,
    });
  };

  return (
    <Card className="bg-secondary/30 border-dashed border-primary/50">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-headline text-primary flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-accent" />
              {suggestion.gesture}
            </CardTitle>
            <CardDescription className="mt-1">
              Suggested Action: <span className="font-medium text-foreground">{suggestion.action}</span>
            </CardDescription>
          </div>
            <Button 
              variant={isAdded ? "outline" : "default"} 
              size="sm" 
              onClick={handleAdd}
              disabled={isAdded}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {isAdded ? "Added" : "Add"}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
      </CardContent>
    </Card>
  );
}
