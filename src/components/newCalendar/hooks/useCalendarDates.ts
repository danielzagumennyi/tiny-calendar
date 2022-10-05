import { useCallback, useMemo, useState } from "react";

import { defaultPickerType, ICalendarProps } from "../components/Calendar";
import {
  addDateByPicker,
  getBaseDate,
  getBasePanelDatesData,
  IBasePanelDatesData,
  subDateByPicker,
} from "../utils/utils";

export type IUseCalendarDates = Pick<Required<ICalendarProps>, "value" | "picker" | "columns" | "rows"> & {
  date?: Date;
  defaultStartDate: Date;
};

export const useCalendarDates = ({
  date,
  value: dates,
  picker = defaultPickerType,
  value,
  columns,
  rows,
  defaultStartDate,
}: IUseCalendarDates) => {
  const [startDate, setStartDate] = useState<Date>(
    date || dates?.[0] || value?.[0] || defaultStartDate,
  );

  const startDates = useMemo(() => {
    return Array(columns * rows)
      .fill(true)
      .map((_, index) => addDateByPicker(getBaseDate({ picker, startDate }), index, picker));
  }, [columns, picker, startDate]);
  console.log("🚀 ~ file: useCalendarDates.ts ~ line 35 ~ baseDates ~ baseDates", startDates)

  const allDates = useMemo(() => {
    const additionalFirstBaseDate = subDateByPicker(startDates[0], 1, picker);
    const additionalLastBaseDate = addDateByPicker(startDates[startDates.length - 1], 1, picker);

    return [additionalFirstBaseDate, ...startDates, additionalLastBaseDate].reduce<
      Record<number, IBasePanelDatesData>
    >(
      (acc, baseDate) => ({
        ...acc,
        [baseDate.valueOf()]: getBasePanelDatesData(baseDate, picker),
      }),
      {},
    );
  }, [startDates, picker]);

  const handlePrev = useCallback(() => {
    setStartDate((prev) => subDateByPicker(prev, startDates.length, picker));
  }, [startDates.length, picker]);

  const handleNext = useCallback(() => {
    setStartDate((prev) => addDateByPicker(prev, startDates.length, picker));
  }, [startDates.length, picker]);

  return { baseDates: startDates, allDates, handleNext, handlePrev, setStartDate };
};
