"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { GestureMapping, PredefinedAction } from "@/types";
import { PREDEFINED_ACTIONS } from "@/types";
import { PlusCircle, Edit3 } from "lucide-react";
import React, { useState, useEffect } from "react";

const gestureMappingSchema = z.object({
  gestureName: z.string().min(2, "Gesture name must be at least 2 characters."),
  action: z.custom<PredefinedAction>((val) => PREDEFINED_ACTIONS.includes(val as PredefinedAction), {
    message: "Please select a valid action.",
  }),
  customActionDescription: z.string().optional(),
  description: z.string().optional(),
});

type GestureMappingFormData = z.infer<typeof gestureMappingSchema>;

interface GestureMappingFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (data: GestureMapping) => void;
  initialData?: GestureMapping | null;
  triggerButton?: React.ReactNode;
}

export function GestureMappingForm({
  isOpen,
  setIsOpen,
  onSubmit,
  initialData,
  triggerButton,
}: GestureMappingFormProps) {
  const [showCustomActionInput, setShowCustomActionInput] = useState(false);

  const form = useForm<GestureMappingFormData>({
    resolver: zodResolver(gestureMappingSchema),
    defaultValues: {
      gestureName: initialData?.gestureName || "",
      action: (initialData?.action as PredefinedAction) || PREDEFINED_ACTIONS[0],
      customActionDescription: initialData?.action && !PREDEFINED_ACTIONS.slice(0, -1).includes(initialData.action as PredefinedAction) ? initialData.action : "",
      description: initialData?.description || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        gestureName: initialData.gestureName,
        action: initialData.action as PredefinedAction,
        customActionDescription: !PREDEFINED_ACTIONS.slice(0, -1).includes(initialData.action as PredefinedAction) ? initialData.action : "",
        description: initialData.description || "",
      });
      setShowCustomActionInput(initialData.action === "Custom Action...");
    } else {
      form.reset({
        gestureName: "",
        action: PREDEFINED_ACTIONS[0],
        customActionDescription: "",
        description: "",
      });
      setShowCustomActionInput(false);
    }
  }, [initialData, form, isOpen]);


  const handleFormSubmit = (values: GestureMappingFormData) => {
    const finalAction = values.action === "Custom Action..." ? values.customActionDescription || "Custom Action" : values.action;
    onSubmit({
      id: initialData?.id || crypto.randomUUID(),
      gestureName: values.gestureName,
      action: finalAction,
      description: values.description,
    });
    form.reset();
    setIsOpen(false);
  };
  
  const watchedAction = form.watch("action");

  useEffect(() => {
    setShowCustomActionInput(watchedAction === "Custom Action...");
  }, [watchedAction]);


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Gesture Mapping" : "Add New Gesture Mapping"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Modify the details of this gesture mapping." : "Define a new gesture and the action it performs."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="gestureName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gesture Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Two Finger Swipe Up" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PREDEFINED_ACTIONS.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showCustomActionInput && (
              <FormField
                control={form.control}
                name="customActionDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Action Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe the custom action" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Briefly describe what this gesture does" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? <Edit3 className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {initialData ? "Save Changes" : "Add Gesture"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
