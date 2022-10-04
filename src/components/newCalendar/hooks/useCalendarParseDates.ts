import { isSameDay, isSameMonth, isSameYear } from "date-fns";
import { useCallback, useMemo } from "react";

import { ICalendarPickerType } from "../components/Calendar";
import { YEAR_GROUP_COUNT } from "../utils/constants";
import {
  addDateByPicker,
  IBaseDateData,
  IBasePanelDatesData,
  IWeekDay,
  subDateByPicker,
} from "../utils/utils";

export type ICalendarModeType = "date" | "range" | "multiple";

export type IUseCalendarParseDates = {
  baseDates: Date[];
  allDates: Record<number, IBasePanelDatesData>;
  picker: ICalendarPickerType;

  week: IWeekDay[];
  weekends?: number[];
  trimWeeks?: boolean;
  disableExternal?: boolean;

  getBetween: (d: Date) => boolean;
  getActive?: (d: Date) => boolean;
  getDisabled?: (d: Date) => boolean;
};

export type IDateItem = {
  weekday: number;
  isWeekend: boolean;
  isActive: boolean;
  isBetween: boolean;
  isExternal: boolean;
  isDisabled: boolean;
  isToday: boolean;
} & IBaseDateData;

type IGetCalendarPanelDates = {
  baseData: IBasePanelDatesData;
  weekends?: number[];
  startDate?: number;
  endDate?: number;
  external?: boolean;
  week: IWeekDay[];

  getActive?: (d: Date) => boolean;
  getBetween?: (d: Date) => boolean;
  getDisabled?: (d: Date) => boolean;
  getToday?: (d: Date) => boolean;
};

export const getCalendarPanelDates = (props: IGetCalendarPanelDates): IDateItem[] => {
  const {
    startDate = 1,
    endDate = props.baseData.numberOfDates,
    external = false,
    week,
    getActive = () => false,
    getDisabled = () => false,
    getBetween = () => false,
    getToday = () => false,
    weekends,
  } = props;

  const days: IDateItem[] = [];

  for (let i = startDate; i <= endDate; i++) {
    const baseData = props.baseData.datesData[i - 1];

    const day: IDateItem = {
      ...baseData,
      weekday: week.indexOf(baseData.day as IWeekDay) + 1,
      isWeekend: Boolean(weekends?.includes(baseData.day)),
      isExternal: external,
      isActive: getActive(baseData.value),
      isBetween: getBetween(baseData.value),
      isDisabled: getDisabled(baseData.value),
      isToday: getToday(baseData.value),
    };

    days.push(day);
  }

  return days;
};

export const useCalendarParseDates = (props: IUseCalendarParseDates) => {
  const {
    weekends,
    trimWeeks,
    allDates,
    baseDates,
    week,
    getDisabled,
    getActive,
    getBetween,
    picker,
    disableExternal,
  } = props;

  const getToday = useCallback(
    (d: Date) => {
      if (picker === "day") {
        return isSameDay(d, new Date());
      } else if (picker === "month") {
        return isSameMonth(d, new Date());
      } else if (picker === "year") {
        return isSameYear(d, new Date());
      }
      return false;
    },
    [picker],
  );

  const parsedDates = useMemo(() => {
    return baseDates.map((baseDate) => {
      const baseData = allDates[baseDate.valueOf()];

      const currentDates: IDateItem[] = getCalendarPanelDates({
        baseData,
        weekends,
        getActive,
        getBetween,
        getDisabled,
        getToday,
        week,
      });

      const beforeBaseData = allDates[subDateByPicker(baseDate, 1, picker).valueOf()];

      let beforeStartDate = 0;

      if (picker === "day") {
        beforeStartDate = beforeBaseData.numberOfDates - currentDates[0].weekday + 2;
      } else if (picker === "year") {
        beforeStartDate = YEAR_GROUP_COUNT;
      }

      const datesBefore: IDateItem[] =
        picker !== "month"
          ? getCalendarPanelDates({
              baseData: beforeBaseData,
              startDate: beforeStartDate,
              external: disableExternal ? false : true,
              weekends,
              week,
              getBetween,
              getActive,
              getDisabled,
            })
          : [];

      const afterBaseData = allDates[addDateByPicker(baseDate, 1, picker).valueOf()];

      let afterEndDate = 0;

      if (picker === "day") {
        const endWeekDay = 7 - currentDates[currentDates.length - 1].weekday;
        const additionalWeek = !trimWeeks && endWeekDay === 0 ? 7 : endWeekDay;
        afterEndDate =
          additionalWeek +
          (currentDates.length + datesBefore.length + additionalWeek === 5 * 7 && !trimWeeks
            ? 7
            : 0);
      } else if (picker === "year") {
        afterEndDate = 1;
      }

      const datesAfter: IDateItem[] =
        picker !== "month"
          ? getCalendarPanelDates({
              baseData: afterBaseData,
              weekends,
              endDate: afterEndDate,
              external: disableExternal ? false : true,
              getActive,
              getBetween,
              getDisabled,
              week,
            })
          : [];

      return {
        before: datesBefore,
        active: currentDates,
        after: datesAfter,
      };
    });
  }, [
    allDates,
    baseDates,
    getActive,
    getBetween,
    getDisabled,
    getToday,
    picker,
    trimWeeks,
    week,
    weekends,
    disableExternal,
  ]);

  return parsedDates;
};
