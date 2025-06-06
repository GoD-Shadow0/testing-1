
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/gesture-flow/Header';
import { GestureMappingForm } from '@/components/gesture-flow/GestureMappingForm';
import { GestureListItem } from '@/components/gesture-flow/GestureListItem';
import { SuggestedGestureItem } from '@/components/gesture-flow/SuggestedGestureItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { GestureMapping, AISuggestion } from '@/types';
import { suggestGestureMappings, type GestureSuggestionOutput } from '@/ai/flows/gesture-suggestion';
import { PlusCircle, Wand2, Camera, Settings, WifiOff, AlertTriangle, Loader2, Hand } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LOCAL_STORAGE_KEY = 'gestureFlowMappings';

export default function ConfigurationPanelPage() {
  const [gestureMappings, setGestureMappings] = useState<GestureMapping[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<GestureMapping | null>(null);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<GestureSuggestionOutput>([]);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [lastTriggeredAction, setLastTriggeredAction] = useState<string | null>(null);

  useEffect(() => {
    const storedMappings = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedMappings) {
      setGestureMappings(JSON.parse(storedMappings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gestureMappings));
  }, [gestureMappings]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };
    getCameraPermission();
  }, [toast]);

  useEffect(() => {
    if (hasCameraPermission === false && isRecognitionActive) {
      setIsRecognitionActive(false);
      setLastTriggeredAction(null);
      toast({
        title: "Recognition Deactivated",
        description: "Camera access is required for gesture recognition.",
        variant: "default",
      });
    }
  }, [hasCameraPermission, isRecognitionActive, toast]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRecognitionActive && hasCameraPermission === true && gestureMappings.length > 0) {
      intervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * gestureMappings.length);
        const detectedGesture = gestureMappings[randomIndex];
        
        setLastTriggeredAction(detectedGesture.action);

        // Perform in-page actions for specific simulated gestures
        if (detectedGesture.action === "Scroll Up") {
          window.scrollBy(0, -100); // Scroll up by 100 pixels
        } else if (detectedGesture.action === "Scroll Down") {
          window.scrollBy(0, 100); // Scroll down by 100 pixels
        }

        toast({
          title: "Gesture Detected!",
          description: (
            <div className="flex items-center">
              <Hand className="h-5 w-5 mr-2 text-primary" />
              <span><strong>{detectedGesture.gestureName}</strong> triggered <strong>{detectedGesture.action}</strong></span>
            </div>
          ),
          variant: "default",
        });
      }, 3000); // Reduced interval to 3 seconds for more frequent feedback
    } else {
      setLastTriggeredAction(null); // Clear last action if recognition stops or conditions not met
    }
    return () => clearInterval(intervalId);
  }, [isRecognitionActive, hasCameraPermission, gestureMappings, toast]);

  const handleFormSubmit = (mapping: GestureMapping) => {
    setGestureMappings(prev => {
      const existingIndex = prev.findIndex(m => m.id === mapping.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = mapping;
        return updated;
      }
      return [...prev, mapping];
    });
    toast({ title: editingMapping ? "Gesture Updated" : "Gesture Added", description: `${mapping.gestureName} configured for ${mapping.action}.`, variant: "default" });
    setEditingMapping(null);
    setIsFormOpen(false);
  };

  const handleEditMapping = (mapping: GestureMapping) => {
    setEditingMapping(mapping);
    setIsFormOpen(true);
  };

  const handleDeleteMapping = (id: string) => {
    const mappingToDelete = gestureMappings.find(m => m.id === id);
    setGestureMappings(prev => prev.filter(m => m.id !== id));
    if (mappingToDelete) {
      toast({ title: "Gesture Deleted", description: `${mappingToDelete.gestureName} has been removed.`, variant: "destructive" });
    }
  };

  const handleFetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await suggestGestureMappings();
      setAiSuggestions(suggestions);
      setIsSuggestionsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch AI suggestions:", error);
      toast({ title: "Error", description: "Could not fetch AI suggestions. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAddSuggestedGesture = (suggestedMapping: Omit<GestureMapping, 'id'>) => {
    const newMapping: GestureMapping = { ...suggestedMapping, id: crypto.randomUUID() };
    if (gestureMappings.some(gm => gm.gestureName === newMapping.gestureName && gm.action === newMapping.action)) {
      toast({ title: "Already Exists", description: "This gesture mapping is already configured.", variant: "default" });
      return;
    }
    setGestureMappings(prev => [...prev, newMapping]);
    toast({ title: "Suggested Gesture Added", description: `${newMapping.gestureName} configured for ${newMapping.action}.` });
  };

  const openAddNewForm = () => {
    setEditingMapping(null);
    setIsFormOpen(true);
  }
  
  const isSuggestionAdded = useCallback((suggestion: AISuggestion) => {
    return gestureMappings.some(gm => gm.gestureName === suggestion.gesture && gm.action === suggestion.action);
  }, [gestureMappings]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-headline">Configuration Panel</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="recognition-switch" className="text-sm font-medium">
                  Gesture Recognition
                </Label>
                <Switch
                  id="recognition-switch"
                  checked={isRecognitionActive}
                  onCheckedChange={(checked) => {
                    setIsRecognitionActive(checked);
                    if (!checked) setLastTriggeredAction(null);
                  }}
                  disabled={hasCameraPermission !== true || gestureMappings.length === 0}
                  aria-label="Toggle gesture recognition"
                />
              </div>
            </div>
            <CardDescription>Manage your gesture mappings and application settings. {gestureMappings.length === 0 && hasCameraPermission === true ? "Add a gesture to enable recognition." : ""}</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4 p-4 border rounded-lg shadow-inner bg-muted/30">
              <h3 className="text-lg font-semibold flex items-center"><Camera className="mr-2 h-5 w-5 text-primary" /> Camera Feed</h3>
              <div className="aspect-video bg-foreground/5 rounded-md flex items-center justify-center border border-dashed relative">
                 <video ref={videoRef} className="w-full h-full aspect-video rounded-md object-cover" autoPlay muted playsInline />
                 {hasCameraPermission === null && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-md">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-muted-foreground">Initializing camera...</p>
                    </div>
                 )}
              </div>
              {hasCameraPermission === false && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>
                    Enable camera permissions in browser settings.
                  </AlertDescription>
                </Alert>
              )}
              <p className={`text-sm font-medium flex items-center ${isRecognitionActive && hasCameraPermission === true ? 'text-green-600' : 'text-red-600'}`}>
                {isRecognitionActive && hasCameraPermission === true ? <WifiOff className="mr-2 h-4 w-4 rotate-180"/> : <WifiOff className="mr-2 h-4 w-4"/>}
                Recognition: {
                  gestureMappings.length === 0 && hasCameraPermission === true ? 'Inactive (Add Gestures)' :
                  hasCameraPermission === false ? 'Inactive (No Camera)' :
                  hasCameraPermission === null ? 'Inactive (Camera initializing)' :
                  isRecognitionActive ? 'Active' : 'Inactive'
                }
              </p>
              {lastTriggeredAction && isRecognitionActive && hasCameraPermission === true && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg shadow">
                  <p className="text-xs text-primary/80 font-medium uppercase tracking-wider mb-1">Last Simulated Action</p>
                  <p className="text-xl font-semibold text-primary text-center">{lastTriggeredAction}</p>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
               <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={openAddNewForm} className="w-full sm:w-auto flex-grow sm:flex-grow-0">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Gesture
                </Button>
                <Button onClick={handleFetchSuggestions} variant="outline" className="w-full sm:w-auto flex-grow sm:flex-grow-0" disabled={isLoadingSuggestions}>
                  {isLoadingSuggestions ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                  Get AI Suggestions
                </Button>
              </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Note: Gesture recognition is a simulation. OS-level actions (e.g., volume control) are not executed.
                    'Scroll Up/Down' will demonstrate in-page scrolling.
                </p>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6 text-foreground">My Gesture Mappings</h2>
          {gestureMappings.length === 0 ? (
            <Card className="text-center py-12 border-dashed bg-card">
              <CardContent className="flex flex-col items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">You haven't configured any gestures yet.</p>
                <p className="text-sm text-muted-foreground">
                  Click "Add New Gesture" or "Get AI Suggestions" to get started. Recognition will be enabled once you add a gesture.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gestureMappings.map(mapping => (
                <GestureListItem
                  key={mapping.id}
                  mapping={mapping}
                  onEdit={handleEditMapping}
                  onDelete={handleDeleteMapping}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <GestureMappingForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingMapping}
      />

      <Dialog open={isSuggestionsModalOpen} onOpenChange={setIsSuggestionsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center">
              <Wand2 className="h-6 w-6 mr-2 text-primary" />
              AI Gesture Suggestions
            </DialogTitle>
            <DialogDescription>
              Here are some gestures suggested by AI. Add them to your configuration if you like.
            </DialogDescription>
          </DialogHeader>
          {aiSuggestions.length === 0 && !isLoadingSuggestions && (
            <p className="text-muted-foreground text-center py-8">No suggestions available at the moment.</p>
          )}
          {isLoadingSuggestions && (
             <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading suggestions...</p>
             </div>
          )}
          <div className="overflow-y-auto flex-grow pr-2 space-y-4">
            {aiSuggestions.map((suggestion, index) => (
              <SuggestedGestureItem
                key={index}
                suggestion={suggestion}
                onAdd={handleAddSuggestedGesture}
                isAdded={isSuggestionAdded(suggestion)}
              />
            ))}
          </div>
           <div className="pt-4 border-t">
            <Button variant="outline" onClick={() => setIsSuggestionsModalOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <footer className="text-center p-4 border-t border-border text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} GestureFlow. Control with a wave.</p>
      </footer>
    </div>
  );
}
