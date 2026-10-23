import { useState, useEffect, useCallback } from "react";
import { Plus, Calendar } from "lucide-react";
import { fetchEventsApi, deleteEventApi } from "../api/events";
import type { Event } from "../types/event";
import { EventCard } from "../components/events/EventCard";
import { EventFormModal } from "../components/events/EventFormModal";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "today" | "all" | "past">("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const apiFilter = filter === "today" ? "all" : filter;
      const data = await fetchEventsApi(apiFilter);

      if (filter === "today") {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        setEvents(
          data.filter((e) => {
            const d = new Date(e.date);
            return d >= startOfToday && d <= endOfToday;
          })
        );
      } else {
        setEvents(data);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDelete = async (id: number) => {
    try {
      await deleteEventApi(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  const tabs: { id: "upcoming" | "today" | "all" | "past"; label: string }[] = [
    { id: "upcoming", label: "Upcoming Events" },
    { id: "today", label: "Today" },
    { id: "all", label: "All Events" },
    { id: "past", label: "Past Events" },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#e6edf3]">Events & Schedule</h2>
          <p className="text-xs text-[#8b949e] mt-1 font-mono">
            Track meetings, sprint reviews, architectural discussions, and release targets
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingEvent(null);
            setIsModalOpen(true);
          }}
          className="text-xs self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          <span>New Event</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-[#222736] pb-1">
        {tabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "px-3 py-2 text-xs font-mono font-medium border-b-2 transition-colors cursor-pointer",
                isActive
                  ? "border-blue-500 text-[#58a6ff] font-semibold"
                  : "border-transparent text-[#8b949e] hover:text-[#e6edf3] hover:border-[#384259]"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Events List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-[#8b949e]">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#222736] bg-[#13161f]/50 p-12 text-center">
            <Calendar className="mx-auto h-8 w-8 text-[#57606a] mb-2.5" />
            <h3 className="text-sm font-semibold text-[#e6edf3]">No events found</h3>
            <p className="text-xs text-[#8b949e] max-w-sm mx-auto mt-1 font-mono">
              {filter === "today"
                ? "No events scheduled for today. Enjoy focus time!"
                : filter === "upcoming"
                ? "No upcoming events found on your calendar."
                : "Your events schedule is clear."}
            </p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => {
                setEditingEvent(null);
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              <span>Schedule An Event</span>
            </Button>
          </div>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={(e) => {
                setEditingEvent(e);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Event Form Modal */}
      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
          loadEvents();
        }}
        eventToEdit={editingEvent}
      />
    </div>
  );
}
