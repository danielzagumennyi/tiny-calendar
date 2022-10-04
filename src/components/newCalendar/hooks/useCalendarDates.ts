import { useCallback, useMemo, useState } from "react";

import { defaultPickerType, ICalendarProps } from "../components/Calendar";
import {
  addDateByPicker,
  getBaseDate,
  getBasePanelDatesData,
  IBasePanelDatesData,
  subDateByPicker,
} from "../utils/utils";

export type IUseCalendarDates = Pick<ICalendarProps, "dates" | "range" | "picker" | "columns"> & {
  date?: Date;
  defaultStartDate: Date;
};

export const useCalendarDates = ({
  date,
  dates,
  picker = defaultPickerType,
  range,
  columns,
  defaultStartDate,
}: IUseCalendarDates) => {
  const [startDate, setStartDate] = useState<Date>(
    date || dates?.[0] || range?.[0] || defaultStartDate,
  );

  const baseDates = useMemo(() => {
    return Array(columns)
      .fill(true)
      .map((_, index) => addDateByPicker(getBaseDate({ picker, startDate }), index, picker));
  }, [columns, picker, startDate]);

  const allDates = useMemo(() => {
    const additionalFirstBaseDate = subDateByPicker(baseDates[0], 1, picker);
    const additionalLastBaseDate = addDateByPicker(baseDates[baseDates.length - 1], 1, picker);

    return [additionalFirstBaseDate, ...baseDates, additionalLastBaseDate].reduce<
      Record<number, IBasePanelDatesData>
    >(
      (acc, baseDate) => ({
        ...acc,
        [baseDate.valueOf()]: getBasePanelDatesData(baseDate, picker),
      }),
      {},
    );
  }, [baseDates, picker]);

  const handlePrev = useCallback(() => {
    setStartDate((prev) => subDateByPicker(prev, baseDates.length, picker));
  }, [baseDates.length, picker]);

  const handleNext = useCallback(() => {
    setStartDate((prev) => addDateByPicker(prev, baseDates.length, picker));
  }, [baseDates.length, picker]);

  return { baseDates, allDates, handleNext, handlePrev, setStartDate };
};
