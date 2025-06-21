import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import PhotoUpload from "@/components/photo-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Upload, Eye, Edit2, Trash2, Camera } from "lucide-react";
import type { Photo, User } from "@shared/schema";

interface PhotoWithUser extends Photo {
  uploadedBy: User;
}

export default function Gallery() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithUser | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ["/api/photos"],
    enabled: isAuthenticated,
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      await apiRequest("DELETE", `/api/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });
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
        description: "Failed to delete photo",
        variant: "destructive",
      });
    },
  });

  const editPhotoMutation = useMutation({
    mutationFn: async ({ photoId, title }: { photoId: number; title: string }) => {
      await apiRequest("PUT", `/api/photos/${photoId}`, { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      setIsEditModalOpen(false);
      setSelectedPhoto(null);
      toast({
        title: "Success",
        description: "Photo updated successfully",
      });
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
        description: "Failed to update photo",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-tactical-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleEdit = (photo: PhotoWithUser) => {
    setSelectedPhoto(photo);
    setEditTitle(photo.title);
    setIsEditModalOpen(true);
  };

  const handleView = (photo: PhotoWithUser) => {
    setSelectedPhoto(photo);
    setIsViewModalOpen(true);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-black mb-2">Combat Gallery</h2>
              <p className="text-gray-600">Action shots and memories from the field</p>
            </div>
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800 font-semibold flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>UPLOAD PHOTOS</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-mono">UPLOAD NEW PHOTOS</DialogTitle>
                </DialogHeader>
                <PhotoUpload onSuccess={() => setIsUploadModalOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {photosLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-tactical-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading photos...</p>
            </div>
          ) : !photos || photos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Photos Yet</h3>
                <p className="text-gray-500 mb-6">Start building your combat gallery by uploading photos.</p>
                <Button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-tactical-orange text-black hover:bg-orange-600"
                >
                  Upload First Photo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo: PhotoWithUser) => {
                const isOwner = user?.id === photo.uploadedBy.id;
                
                return (
                  <div key={photo.id} className="group relative bg-black overflow-hidden shadow-lg hover:shadow-xl transition-shadow rounded-lg">
                    <img 
                      src={`/uploads/${photo.filename}`}
                      alt={photo.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 flex space-x-3">
                        <Button
                          size="sm"
                          onClick={() => handleView(photo)}
                          className="bg-white text-black hover:bg-gray-200"
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                        {isOwner && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleEdit(photo)}
                              className="bg-tactical-orange text-black hover:bg-orange-600"
                            >
                              <Edit2 className="w-5 h-5" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => deletePhotoMutation.mutate(photo.id)}
                              disabled={deletePhotoMutation.isPending}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <h3 className="text-white font-semibold">{photo.title}</h3>
                      <p className="text-gray-300 text-sm">
                        by {photo.uploadedBy.firstName || photo.uploadedBy.email} • {formatTimeAgo(photo.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* View Photo Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-mono">{selectedPhoto?.title}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <img 
                src={`/uploads/${selectedPhoto.filename}`}
                alt={selectedPhoto.title}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
              <div className="text-sm text-gray-600">
                <p>Uploaded by {selectedPhoto.uploadedBy.firstName || selectedPhoto.uploadedBy.email}</p>
                <p>{formatTimeAgo(selectedPhoto.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Photo Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-mono">EDIT PHOTO</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter photo title"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => editPhotoMutation.mutate({ 
                    photoId: selectedPhoto.id, 
                    title: editTitle 
                  })}
                  disabled={editPhotoMutation.isPending}
                  className="bg-tactical-orange text-black hover:bg-orange-600"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
