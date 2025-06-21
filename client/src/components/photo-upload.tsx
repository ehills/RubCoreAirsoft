import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, X, Image } from "lucide-react";

const uploadFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

interface PhotoUploadProps {
  onSuccess: () => void;
}

export default function PhotoUpload({ onSuccess }: PhotoUploadProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      if (!selectedFile) {
        throw new Error("No file selected");
      }

      const formData = new FormData();
      formData.append("photo", selectedFile);
      formData.append("title", data.title);

      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Generate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Auto-fill title with filename (without extension)
      const title = file.name.replace(/\.[^/.]+$/, "");
      form.setValue("title", title);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    form.setValue("title", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (data: UploadFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        {previewUrl ? (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-w-full max-h-64 mx-auto rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div>
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Upload a photo</p>
            <p className="text-gray-500 mb-4">Drag and drop or click to select</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Form */}
      {selectedFile && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter photo title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-tactical-orange text-black hover:bg-orange-600"
              >
                {mutation.isPending ? "Uploading..." : "Upload Photo"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
