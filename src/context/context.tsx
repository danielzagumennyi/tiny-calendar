import { isSameDay } from "date-fns";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultPickerType, ICalendarProps } from "../components/newCalendar/components/Calendar";
import { useCalendarDates } from "../components/newCalendar/hooks/useCalendarDates";
import { IDateItem, useCalendarParseDates } from "../components/newCalendar/hooks/useCalendarParseDates";
import { useDefaultStartDate } from "../components/newCalendar/hooks/useDefaultStartDate";
import { ICalendarPickerType } from "../components/newCalendar/NewCalendar";
import { getWeek, IObjectRange, isActive, isBetween, isDisabled, objectRangeToArray, sortDates, toggleDate } from "../components/newCalendar/utils/utils";

type State = any

export const Context = createContext<
  State | undefined
>(undefined)

const emptyObjectRange: Required<IObjectRange> = {
  start: new Date("invalid"),
  end: new Date("invalid"),
};

export const Provider = ({ children, ...props }: { children: ReactNode } & ICalendarProps) => {
  
  const {
    columns = 1,
    rows = 1,
    value,
    mode = "date",
    weekends,
    locale = "en-en",
    trimWeeks,
    disabled,
    minDate,
    maxDate,
    alwaysRange = true, // toDo fix it
    onChange,
    onClear,
    weekStartDay = 0,
    picker = defaultPickerType,
    hoverRange,
    disableExternal,
    validateRange,
    className,
  } = props;

  const [dynamicPicker, setDynamicPicker] = useState<ICalendarPickerType | null>(null);

  const week = useMemo(() => {
    return getWeek(weekStartDay);
  }, [weekStartDay]);

  const disabledRanges: Array<[Date, Date]> = useMemo(() => {
    return (disabled?.filter((r) => Array.isArray(r)) || []) as [Date, Date][];
  }, [disabled]);

  const disabledDates = useMemo(() => {
    return (disabled?.filter((d) => typeof d === "object") || []) as Date[];
  }, [disabled]);

  const getDisabled = useCallback(
    (d: Date) => {
      return isDisabled(d, { minDate, maxDate, ranges: disabledRanges, dates: disabledDates });
    },
    [disabledDates, disabledRanges, maxDate, minDate],
  );

  const defaultStartDate = useDefaultStartDate({ getDisabled, picker, week });

  const { allDates, baseDates, handleNext, handlePrev, setStartDate } = useCalendarDates({
    columns,
    rows,
    value: [],
    picker,
    defaultStartDate,
  });

  const [localRange, setLocalRange] = useState<IObjectRange>({});
  const [hoverRangeValue, setHoverRangeValue] = useState<IObjectRange>({});

  useEffect(() => {
    setLocalRange({});
    setHoverRangeValue({});
  }, [value, picker, mode]);

  const activeSortedRange = useMemo(() => {
    const rangeArray = objectRangeToArray(localRange);

    const localRangeArray = rangeArray.slice(0, 2).filter((d) => !!d);
    return sortDates(localRangeArray.length > 0 ? localRangeArray : value || []);
  }, [localRange, value]);

  const getActive = useCallback(
    (d: Date) => isActive(d, { mode, dates: value || [], range: activeSortedRange, picker }),
    [value, mode, activeSortedRange, picker],
  );

  const sortedHoverRange = useMemo<Date[]>(() => {
    if (hoverRange) {
      const rangeArray = objectRangeToArray(hoverRangeValue);

      return rangeArray.slice(0, 2).filter((d) => !!d);
    }
    return [];
  }, [hoverRange, hoverRangeValue]);

  const getBetween = useCallback(
    (d: Date): boolean => {
      return (
        (mode === "range" && activeSortedRange.length === 2 && isBetween(d, activeSortedRange)) ||
        (!!hoverRange && isBetween(d, sortedHoverRange))
      );
    },
    [activeSortedRange, hoverRange, mode, sortedHoverRange],
  );

  const datesGroupedByPanel = useCalendarParseDates({
    baseDates,
    allDates,
    picker,
    week,

    weekends,
    trimWeeks,
    disableExternal,

    getActive,
    getBetween,
    getDisabled,
  });

  const handleDatesChange = useCallback(
    (date: IDateItem) => onChange?.(toggleDate(date.value, value || [])),
    [value, onChange],
  );

  const handleRangeChange = useCallback(
    (date: IDateItem) => {
      if (hoverRange) {
        if (!localRange.start) {
          setLocalRange(hoverRangeValue);
        } else {
          const range = { ...emptyObjectRange, ...hoverRangeValue };

          const isValid = typeof validateRange === "function" ? validateRange(range) : true;

          if (!isValid) return;

          const datesArray = objectRangeToArray(range);
          const sortedDates = sortDates(datesArray);

          onChange?.(sortedDates);
        }
      } else if (localRange.start) {
        const range: Required<IObjectRange> = {
          ...emptyObjectRange,
          ...localRange,
          end: date.value,
        };

        const isValid = typeof validateRange === "function" ? validateRange(range) : true;

        if (!isValid) return;

        const datesArray = objectRangeToArray(range);
        const sortedDates = sortDates(datesArray);

        onChange?.(sortedDates);
      } else {
        if (!alwaysRange && date.value !== value?.[0] && date.value === value?.[1]) {
          onChange?.([date.value, date.value]);
        } else if (!alwaysRange && date.value === value?.[0] && date.value === value?.[1]) {
          onChange?.([]);
        } else {
          setLocalRange(
            hoverRange
              ? { start: hoverRangeValue.start }
              : {
                start: date.value,
              },
          );
        }
      }
    },
    [alwaysRange, hoverRange, hoverRangeValue, localRange, onChange, validateRange],
  );

  const handleDateHover = useCallback(
    (date: IDateItem) => {
      if (date.isDisabled) {
        return;
      }

      if (hoverRange) {
        const range =
          objectRangeToArray(hoverRangeValue).length < 2
            ? hoverRange?.(date.value)
            : date.value.valueOf() > (localRange.start?.valueOf() || 0)
              ? {
                start: hoverRange(localRange.start || date.value).start,
                end: hoverRange?.(date.value).end,
              }
              : {
                start: hoverRange(localRange.start || date.value).end,
                end: hoverRange?.(date.value).start,
              };

        setHoverRangeValue((state) => {
          return { ...state, ...range };
        });

        if (localRange.start) {
          setLocalRange((state) => ({ ...state, ...range }));
        }
      } else if (localRange.start) {
        setLocalRange({
          start: localRange.start,
          end: date.value,
        });
      }
    },
    [hoverRange, hoverRangeValue, localRange.start],
  );

  const handleDateClick = useCallback(
    (date: IDateItem) => {
      if (date.isDisabled) return;

      if (date.isExternal) {
        setStartDate(date.value);
      }

      const map = {
        date: (date: IDateItem) => {
          !props.value || !isSameDay(date.value, props.value[0])
            ? onChange?.([date.value])
            : onClear?.();
        },
        multiple: handleDatesChange,
        range: handleRangeChange,
      };

      map[mode]?.(date);
    },
    [handleDatesChange, handleRangeChange, mode, onClear, onChange, props.value, setStartDate],
  );

  const dateCellFormat = useCallback(
    ({ value }: IDateItem) => {
      if (picker === "day") {
        return value.toLocaleDateString(locale, { day: "numeric" });
      } else if (picker === "month") {
        return value.toLocaleDateString(locale, { month: "short" });
      } else if (picker === "year") {
        return value.toLocaleDateString(locale, { year: "numeric" });
      }
    },
    [picker, locale],
  );

    const store = {
      value,
      allDates,
      alwaysRange,
      baseDates,
      columns,
      rows,
      datesGroupedByPanel,
      picker,
      setDynamicPicker,
      locale,
      dateCellFormat,
      setStartDate,
      handleDateClick,
      dynamicPicker,
      handleDateHover,
    }

  return (
    <Context.Provider value={store}>
      {children}
    </Context.Provider>
  )
}

export const useStore = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useStore must be used within a Provider')
  }
  return context
}