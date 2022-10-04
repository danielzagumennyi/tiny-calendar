import { set } from "date-fns";
import { useMemo } from "react";

import { ICalendarPickerType } from "../NewCalendar";
import { getBaseDate, getBasePanelDatesData, IWeekDay, subDateByPicker } from "../utils/utils";
import { getCalendarPanelDates, IDateItem } from "./useCalendarParseDates";

export const useDefaultStartDate = ({
  getDisabled,
  picker,
  week,
}: {
  getDisabled: (d: Date) => boolean;
  picker: ICalendarPickerType;
  week: IWeekDay[];
}) => {
  return useMemo(() => {
    const startDate = set(new Date(), { date: 1 });

    const currentPanelDates: IDateItem[] = getCalendarPanelDates({
      baseData: getBasePanelDatesData(getBaseDate({ picker, startDate }), picker),
      getDisabled,
      week,
    });

    const allDatesDisabled = currentPanelDates.every((d) => d.isDisabled);

    if (allDatesDisabled) {
      return subDateByPicker(startDate, 1, picker);
    } else {
      return startDate;
    }
  }, [getDisabled, picker, week]);
};
