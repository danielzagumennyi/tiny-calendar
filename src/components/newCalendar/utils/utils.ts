import {
  add,
  getDate,
  getDay,
  getDaysInMonth,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isSameYear,
  set,
  sub,
} from "date-fns";

import { ICalendarPickerType } from "../components/Calendar";
import { ICalendarModeType } from "../hooks/useCalendarParseDates";
import { MONTH_GROUP_COUNT, YEAR_GROUP_COUNT } from "./constants";

export const parseDate = (d: Date) => {
  return {
    value: d,
    year: getYear(d),
    month: getMonth(d),
    date: getDate(d),
    day: getDay(d),
  };
};

export type IBasePanelDatesData = {
  baseDate: Date;
  numberOfDates: number;
  datesData: IBaseDateData[];
};

export type IBaseDateData = {
  value: Date;
  day: number;
  date: number;
  month: number;
  year: number;
};

export const getBaseDate = ({
  picker,
  startDate,
}: {
  picker: ICalendarPickerType;
  startDate: Date;
}) => {
  const month = picker === "day" ? startDate.getMonth() : 0;
  const year =
    picker === "year"
      ? Math.floor(startDate.getFullYear() / YEAR_GROUP_COUNT) * YEAR_GROUP_COUNT
      : startDate.getFullYear();

  return new Date(year, month, 1);
};

export const getBasePanelDatesData = (
  baseDate: Date,
  picker: ICalendarPickerType,
): IBasePanelDatesData => {
  let numberOfDates = 0;
  const datesData: IBaseDateData[] = [];

  if (picker === "day") {
    numberOfDates = getDaysInMonth(baseDate);

    for (let i = 1; i <= numberOfDates; i++) {
      datesData.push(
        parseDate(
          set(baseDate, {
            date: i,
          }),
        ),
      );
    }
  } else if (picker === "month") {
    numberOfDates = MONTH_GROUP_COUNT;

    for (let i = 0; i < numberOfDates; i++) {
      datesData.push(
        parseDate(
          add(baseDate, {
            months: i,
          }),
        ),
      );
    }
  } else if (picker === "year") {
    numberOfDates = YEAR_GROUP_COUNT;

    for (let i = 0; i < numberOfDates; i++) {
      datesData.push(
        parseDate(
          add(baseDate, {
            years: i,
          }),
        ),
      );
    }
  }

  return {
    baseDate,
    datesData,
    numberOfDates,
  };
};

export const sortDates = (dates: Date[]): Date[] => dates.sort((a, b) => a.getTime() - b.getTime());

export const isBetween = (d: Date, range: Date[]): boolean => {
  return (
    (isSameDay(d, range[0]) || isAfter(d, range[0])) &&
    (isSameDay(d, range[1]) || isBefore(d, range[1]))
  );
};

interface IDisabledOptions {
  dates?: Date[];
  ranges?: Array<[Date, Date]>;
  minDate?: Date;
  maxDate?: Date;
}

export const isDisabled = (d: Date, { minDate, maxDate, dates, ranges }: IDisabledOptions) => {
  return (
    (minDate && Boolean(isBefore(d, minDate))) ||
    (maxDate && Boolean(isAfter(d, maxDate))) ||
    Boolean(dates?.find((dd) => isSameDay(d, dd))) ||
    Boolean(ranges?.find((r) => isBetween(d, r)))
  );
};

interface IActiveDateOptions {
  mode: ICalendarModeType;
  date?: Date;
  dates?: Date[];
  range?: Date[];
  picker: ICalendarPickerType;
}

export const isActive = (d: Date, { mode, date, dates, range, picker }: IActiveDateOptions) => {
  if (mode === "date") {
    return Boolean(date && compareDatesByPicker(d, date, picker));
  }

  if (mode === "multiple") {
    return Boolean(dates?.find((dd) => compareDatesByPicker(d, dd, picker)));
  }

  if (mode === "range") {
    return Boolean(range?.find((dd) => compareDatesByPicker(d, dd, picker)));
  }

  return false;
};

export const includesDate = (date: Date, dates: Date[]) =>
  Boolean(dates.find((d) => isSameDay(d, date)));

export const toggleDate = (date: Date, dates: Date[]) => {
  const includes = includesDate(date, dates);
  return includes ? dates.filter((d) => !isSameDay(d, date)) : [...dates, date];
};

export const addDateByPicker = (date: Date, val: number, picker: ICalendarPickerType) => {
  return add(date, {
    years: picker === "month" ? val : picker === "year" ? val * YEAR_GROUP_COUNT : 0,
    months: picker === "day" ? val : 0,
  });
};

export const subDateByPicker = (date: Date, val: number, picker: ICalendarPickerType) => {
  return sub(date, {
    years: picker === "month" ? val : picker === "year" ? val * YEAR_GROUP_COUNT : 0,
    months: picker === "day" ? val : 0,
  });
};

export const compareDatesByPicker = (
  dateLeft: Date,
  dateRight: Date,
  picker: ICalendarPickerType,
) => {
  const functionsMap: Record<
    ICalendarPickerType,
    (dateLeft: Date | number, dateRight: Date | number) => boolean
  > = {
    day: isSameDay,
    month: isSameMonth,
    year: isSameYear,
  };

  return functionsMap[picker](dateLeft, dateRight);
};

export type IObjectRange = {
  start?: Date;
  end?: Date;
};

export const objectRangeToArray = (r: IObjectRange): Date[] => {
  return Object.values(r).filter((d) => Boolean(d));
};

export type IWeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const getWeek = (start: IWeekDay) => {
  const week: IWeekDay[] = [0, 1, 2, 3, 4, 5, 6];
  return week.slice(start).concat(week.slice(0, start));
};
