
import { isSameDay } from "date-fns";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { useCalendarDates } from "../hooks/useCalendarDates";
import {
  ICalendarModeType,
  IDateItem,
  useCalendarParseDates,
} from "../hooks/useCalendarParseDates";
import { useDefaultStartDate } from "../hooks/useDefaultStartDate";
import {
  getWeek,
  IObjectRange,
  isActive,
  isBetween,
  isDisabled,
  IWeekDay,
  objectRangeToArray,
  sortDates,
  toggleDate,
} from "../utils/utils";
import { DaysCell, DaysGrid, Panel } from "./Panel";
import { PanelHeader } from "./PanelHeader";

export const calendarPickerTypeList = ["day", "month", "year"] as const;
export type ICalendarPickerType = typeof calendarPickerTypeList[number];

export const defaultPickerType: ICalendarPickerType = "day";
export type ICalendarHoverRangeType = (date: Date) => IObjectRange;

export type ICalendarProps = {
  className?: string;
  columns?: number;
  mode?: ICalendarModeType;
  locale?: string;

  date?: Date;
  dates?: Date[];
  range?: Date[];

  alwaysRange?: boolean;
  onDateChange?: (v: Date) => void;
  onDatesChange?: (v: Date[]) => void;
  onRangeChange?: (v: Date[]) => void;
  onClear?: () => void;

  hoverRange?: ICalendarHoverRangeType;
  disableExternal?: boolean;

  weekends?: number[];
  trimWeeks?: boolean;
  disabled?: Array<Date | [Date, Date]>;
  minDate?: Date;
  maxDate?: Date;
  weekStartDay?: IWeekDay;
  /** @deprecated */
  interactiveRange?: boolean;
  picker?: ICalendarPickerType;

  validateRange?: (dates: Required<IObjectRange>) => boolean;
};

export interface IPeriodPreset {
  label: string;
  id: string;
  value?: Date[];
  onClick?: () => void;
  active?: boolean;
}

const emptyObjectRange: Required<IObjectRange> = {
  start: new Date("invalid"),
  end: new Date("invalid"),
};

const _Calendar = memo((props: ICalendarProps) => {
  const {
    columns = 1,
    date,
    dates,
    range,
    mode = "date",
    weekends,
    locale = "en-en",
    trimWeeks,
    disabled,
    minDate,
    maxDate,
    alwaysRange = true, // toDo fix it
    onDateChange,
    onDatesChange,
    onRangeChange,
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
    date,
    dates,
    picker,
    range,
    defaultStartDate,
  });

  const [localRange, setLocalRange] = useState<IObjectRange>({});
  const [hoverRangeValue, setHoverRangeValue] = useState<IObjectRange>({});

  useEffect(() => {
    setLocalRange({});
    setHoverRangeValue({});
  }, [range, picker, mode]);

  const activeSortedRange = useMemo(() => {
    const rangeArray = objectRangeToArray(localRange);

    const localRangeArray = rangeArray.slice(0, 2).filter((d) => !!d);
    return sortDates(localRangeArray.length > 0 ? localRangeArray : range || []);
  }, [localRange, range]);

  const getActive = useCallback(
    (d: Date) => isActive(d, { mode, date, dates, range: activeSortedRange, picker }),
    [date, dates, mode, activeSortedRange, picker],
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
    (date: IDateItem) => onDatesChange?.(toggleDate(date.value, dates || [])),
    [dates, onDatesChange],
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

          onRangeChange?.(sortedDates);
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

        onRangeChange?.(sortedDates);
      } else {
        if (!alwaysRange && date.value !== range?.[0] && date.value === range?.[1]) {
          onRangeChange?.([date.value, date.value]);
        } else if (!alwaysRange && date.value === range?.[0] && date.value === range?.[1]) {
          onRangeChange?.([]);
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
    [alwaysRange, hoverRange, hoverRangeValue, localRange, onRangeChange, range, validateRange],
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
          !props.date || !isSameDay(date.value, props.date)
            ? onDateChange?.(date.value)
            : onClear?.();
        },
        multiple: handleDatesChange,
        range: handleRangeChange,
      };

      map[mode]?.(date);
    },
    [handleDatesChange, handleRangeChange, mode, onClear, onDateChange, props.date, setStartDate],
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

  return (
    <Wrapper className={className}>
      <PanelsGrid>
        <AnimWrapper $columns={columns}>
          {datesGroupedByPanel.map(({ active, before, after }) => {
            return (
              <PanelsItem key={active[0].value.toLocaleDateString()}>
                <Header>
                  <HeaderTitle>
                    {picker === "day" ? (
                      <>
                        <HoverSpan onClick={() => setDynamicPicker("month")}>
                          {active[0].value.toLocaleString(locale, { month: "long" })}
                        </HoverSpan>
                        <HoverSpan onClick={() => setDynamicPicker("year")}>
                          {active[0].value.toLocaleString(locale, { year: "numeric" })}
                        </HoverSpan>
                      </>
                    ) : picker === "month" ? (
                      <HoverSpan onClick={() => setDynamicPicker("year")}>
                        {active[0].value.toLocaleDateString(locale, { year: "numeric" })}
                      </HoverSpan>
                    ) : picker === "year" ? (
                      `${active[0].value.getFullYear()}-${active[0].value.getFullYear() + 9}`
                    ) : null}
                  </HeaderTitle>
                </Header>
                {picker === "day" && (
                  <PanelHeader locale={locale} monthsData={datesGroupedByPanel} />
                )}

                <Panel
                  dateCellFormat={dateCellFormat}
                  picker={picker}
                  onClick={handleDateClick}
                  onHover={handleDateHover}
                  active={active}
                  before={before}
                  after={after}
                />
              </PanelsItem>
            );
          })}
        </AnimWrapper>
      </PanelsGrid>

      {dynamicPicker === "month" && (
        <DynamicPickerWrapper>
          <Calendar
            {...props}
            mode={"date"}
            picker="month"
            onDateChange={(date) => {
              setDynamicPicker(null);
              setStartDate(date);
            }}
          />
        </DynamicPickerWrapper>
      )}

      {dynamicPicker === "year" && (
        <DynamicPickerWrapper>
          <Calendar
            {...props}
            mode={"date"}
            picker="year"
            onDateChange={(date) => {
              setDynamicPicker(null);
              setStartDate(date);
            }}
          />
        </DynamicPickerWrapper>
      )}
    </Wrapper>
  );
});

const DynamicPickerWrapper = styled.div`
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  & > div {
    height: 100%;
    width: 100%;
  }
`;

const AnimWrapper = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$columns}, 1fr);
  grid-gap: 32px;
  padding: 24px;
  flex: 1;
  width: 100%;
`;

const HoverSpan = styled.div`
  transition: color 0.2s ease;
  cursor: pointer;

  &:hover {
    color: blue;
  }

  & + & {
    margin-left: 8px;
  }
`;

const PanelsItem = styled.div`
  display: flex;
  flex-direction: column;
`;


const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const HeaderTitle = styled.div`
  display: flex;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Header = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PanelsGrid = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Wrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  background-color: white;
  width: 100%;
  flex: 1;
  border: 1px solid grey;
`;

export const Calendar = Object.assign(_Calendar, {
  Wrapper,
  Header,
  HeaderControls,
  PanelsGrid,
  PanelsItem,
  DaysGrid,
  DaysCell,
});
