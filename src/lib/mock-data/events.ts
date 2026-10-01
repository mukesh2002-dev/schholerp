import { CalendarEvent, EventVenue } from "@/types";

// No dummy/test events — the Events Calendar is fully API-driven.
// Empty fallbacks keep legacy mock-db imports working without seeding fake rows.
export const initialEventVenues: EventVenue[] = [];

export const initialCalendarEvents: CalendarEvent[] = [];
