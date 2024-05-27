import {
  TimeField,
  Label,
  DateInput,
  DateSegment,
  Group,
} from "react-aria-components";

import { type Time } from "@internationalized/date";

interface TimePickerComponentProps {
  label: string;
  time: Time;
  onChange: (date: Time) => void;
}

export default function TimePickerComponent({
  label,
  time,
  onChange,
}: TimePickerComponentProps) {
  return (
    <TimeField value={time} onChange={onChange}>
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
      </Group>
    </TimeField>
  );
}
