import React from 'react';
import {
  Calendar,
  CalendarCurrentDate,
  CalendarDayView,
  CalendarMonthView,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
  CalendarViewTrigger,
  CalendarWeekView,
  CalendarYearView,
} from '../ui/full-calendar';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import type { CalendarEvent } from '../ui/full-calendar';

interface FullCalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export const FullCalendar: React.FC<FullCalendarProps> = ({
  events = [],
  onEventClick,
}) => {
  return (
    <Calendar events={events} onEventClick={onEventClick}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <CalendarCurrentDate />
          </div>

          <div className="flex items-center gap-1.5">
            <CalendarViewTrigger view="day">Day</CalendarViewTrigger>
            <CalendarViewTrigger view="week">Week</CalendarViewTrigger>
            <CalendarViewTrigger view="month">Month</CalendarViewTrigger>
            <CalendarViewTrigger view="year">Year</CalendarViewTrigger>
          </div>

          <div className="flex items-center gap-1">
            <CalendarTodayTrigger size="sm">Today</CalendarTodayTrigger>
            <CalendarPrevTrigger size="icon" variant="outline">
              <ChevronLeft className="w-4 h-4" />
            </CalendarPrevTrigger>
            <CalendarNextTrigger size="icon" variant="outline">
              <ChevronRight className="w-4 h-4" />
            </CalendarNextTrigger>
          </div>
        </div>

        {/* Views */}
        <div className="flex-1 overflow-hidden pt-2">
          <CalendarDayView />
          <CalendarWeekView />
          <CalendarMonthView />
          <CalendarYearView />
        </div>
      </div>
    </Calendar>
  );
};
