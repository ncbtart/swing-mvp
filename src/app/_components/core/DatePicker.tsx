"use client";

import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Label,
  Popover,
} from "react-aria-components";

import {
  parseAbsoluteToLocal,
  getLocalTimeZone,
  toCalendarDate,
  today,
} from "@internationalized/date";

import type {
  ButtonProps,
  DateValue,
  PopoverProps,
} from "react-aria-components";
import ChevronLeftIcon from "@spectrum-icons/workflow/ChevronLeft";
import ChevronRightIcon from "@spectrum-icons/workflow/ChevronRight";
import { useEffect, useState } from "react";

interface DatePickerComponentProps {
  label: string;
  selectedDate: string;
  onDateChange: (date: string | null) => void;
  noPastDate?: boolean;
}

export default function DatePickerComponent({
  selectedDate,
  onDateChange,
  label,
  noPastDate = false,
}: DatePickerComponentProps) {
  const [dateValue, setDateValue] = useState<DateValue | null>(null);

  useEffect(() => {
    try {
      // check if the selected date is a valid date
      if (!selectedDate) {
        setDateValue(null);
        return;
      }

      const parsedDate = parseAbsoluteToLocal(selectedDate);

      if (parsedDate) {
        setDateValue(parsedDate);
      } else {
        setDateValue(null);
      }
    } catch (error) {
      console.error(error);
      setDateValue(null);
    }
  }, [selectedDate]);

  function handleDateChange(newDateString: string) {
    onDateChange(newDateString);
  }

  return (
    <DatePicker
      className="group flex w-full flex-col gap-1"
      value={dateValue ? toCalendarDate(dateValue) : null}
      onChange={(date) => {
        handleDateChange(date.toDate(getLocalTimeZone()).toISOString());
      }}
      minValue={noPastDate ? today(getLocalTimeZone()) : undefined}
    >
      <Label className="block text-sm font-medium text-gray-900">{label}</Label>
      <Group className="mt-2 flex rounded-lg bg-white/90 p-3 text-sm text-gray-700 shadow-sm transition group-open:bg-white">
        <DateInput className="flex flex-1">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="rounded-sm px-0.5 tabular-nums caret-transparent outline-none placeholder-shown:italic focus:bg-blue-500 focus:text-white"
            />
          )}
        </DateInput>
        <Button className="flex items-center bg-transparent text-gray-700 outline-none ring-black transition focus-visible:ring-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-5 text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
            />
          </svg>
        </Button>
      </Group>
      <MyPopover>
        <Dialog className="p-6 text-gray-600">
          <Calendar>
            <header className="flex w-full items-center gap-1 px-1 pb-4 font-serif">
              <Heading className="ml-2 flex-1 font-sans text-xl font-semibold" />
              <RoundButton slot="previous">
                <ChevronLeftIcon />
              </RoundButton>
              <RoundButton slot="next">
                <ChevronRightIcon />
              </RoundButton>
            </header>
            <CalendarGrid className="border-separate border-spacing-1">
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell className="text-xs font-semibold text-gray-500">
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell
                    date={date}
                    className="flex h-9 w-9 cursor-default items-center justify-center rounded-full outline-none ring-blue-600/70 ring-offset-2 outside-month:text-gray-300 hover:bg-gray-100 focus-visible:ring pressed:bg-gray-200 selected:bg-blue-700 selected:text-white"
                  />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </MyPopover>
    </DatePicker>
  );
}

function RoundButton(props: ButtonProps) {
  return (
    <Button
      {...props}
      className="flex h-9 w-9 cursor-default items-center justify-center rounded-full border-0 bg-transparent text-gray-600 outline-none ring-violet-600/70 ring-offset-2 hover:bg-gray-100 focus-visible:ring pressed:bg-gray-200"
    />
  );
}

function MyPopover(props: PopoverProps) {
  return (
    <Popover
      {...props}
      className={({ isEntering, isExiting }) => `
        overflow-auto rounded-lg bg-white ring-1 ring-black/10 drop-shadow-lg
        ${
          isEntering
            ? "duration-200 ease-out animate-in fade-in placement-top:slide-in-from-bottom-1 placement-bottom:slide-in-from-top-1"
            : ""
        }
        ${
          isExiting
            ? "duration-150 ease-in animate-out fade-out placement-top:slide-out-to-bottom-1 placement-bottom:slide-out-to-top-1"
            : ""
        }
      `}
    />
  );
}
