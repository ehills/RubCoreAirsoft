import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import EventForm from "@/components/event-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, MapPin, Users, Edit2, Trash2, Check, X } from "lucide-react";
import type { Event } from "@shared/schema";

export default function Events() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated,
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await apiRequest("DELETE", `/api/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
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
        description: "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const toggleAttendanceMutation = useMutation({
    mutationFn: async ({ eventId, attending }: { eventId: number; attending: boolean }) => {
      if (attending) {
        await apiRequest("DELETE", `/api/events/${eventId}/attend`);
      } else {
        await apiRequest("POST", `/api/events/${eventId}/attend`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
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
        description: "Failed to update attendance",
        variant: "destructive",
      });
    },
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["/api/events", "attendance"],
    queryFn: async () => {
      if (!events || !user) return {};
      
      const attendancePromises = events.map(async (event: Event) => {
        const response = await fetch(`/api/events/${event.id}/attending`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          return { [event.id]: data.attending };
        }
        return { [event.id]: false };
      });
      
      const attendanceResults = await Promise.all(attendancePromises);
      return attendanceResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    },
    enabled: !!events && !!user,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-black mb-2">Mission Operations</h2>
              <p className="text-gray-600">Upcoming events and training sessions</p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800 font-semibold flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>CREATE EVENT</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-mono">CREATE NEW EVENT</DialogTitle>
                </DialogHeader>
                <EventForm onSuccess={() => setIsCreateModalOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {eventsLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-tactical-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          ) : !events || events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Scheduled</h3>
                <p className="text-gray-500 mb-6">No upcoming events have been created yet.</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-tactical-orange text-black hover:bg-orange-600"
                >
                  Create First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {events.map((event: Event) => {
                const isAttending = attendanceData?.[event.id] || false;
                const isCreator = user?.id === event.createdBy;
                
                return (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className="bg-tactical-orange text-black font-mono font-medium">
                              CONFIRMED
                            </Badge>
                            <span className="text-gray-500 font-mono text-sm">
                              {formatDate(event.date)}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-black mb-2">{event.title}</h3>
                          <p className="text-gray-600 mb-4">{event.description}</p>
                          <div className="flex items-center space-x-6 text-gray-500">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                        {isCreator && (
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsEditModalOpen(true);
                              }}
                              className="text-gray-400 hover:text-tactical-orange"
                            >
                              <Edit2 className="w-5 h-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEventMutation.mutate(event.id)}
                              disabled={deleteEventMutation.isPending}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <Button
                          onClick={() => toggleAttendanceMutation.mutate({ 
                            eventId: event.id, 
                            attending: isAttending 
                          })}
                          disabled={toggleAttendanceMutation.isPending}
                          className={
                            isAttending 
                              ? "bg-tactical-orange text-black hover:bg-orange-600 font-semibold" 
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                          }
                        >
                          {isAttending ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              ATTENDING
                            </>
                          ) : (
                            "MARK ATTENDING"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Edit Event Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono">EDIT EVENT</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventForm 
              event={selectedEvent} 
              onSuccess={() => {
                setIsEditModalOpen(false);
                setSelectedEvent(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
