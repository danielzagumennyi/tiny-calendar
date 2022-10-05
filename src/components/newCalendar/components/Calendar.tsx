import { memo } from "react";
import styled from "styled-components";
import { Provider, useStore } from "../../../context/context";

import { ICalendarModeType } from "../hooks/useCalendarParseDates";
import { IObjectRange, IWeekDay } from "../utils/utils";
import { DaysCell, DaysGrid, Panel } from "./Panel";
import { PanelHeader } from "./PanelHeader";

export const calendarPickerTypeList = ["day", "month", "year"] as const;
export type ICalendarPickerType = typeof calendarPickerTypeList[number];

export const defaultPickerType: ICalendarPickerType = "day";
export type ICalendarHoverRangeType = (date: Date) => IObjectRange;

export type ICalendarProps = {
  className?: string;
  columns?: number;
  rows?: number;
  mode?: ICalendarModeType;
  locale?: string;

  value?: Date[] | null;

  onChange?: (v: Date[]) => void;
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

const _Calendar = memo(() => {
  const {
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
  } = useStore();

  return (
    <Wrapper>
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
        <Provider
          mode={"date"}
          picker="month"
          onChange={(date) => {
            setDynamicPicker(null);
            setStartDate(date);
          }}
        >
          <DynamicPickerWrapper>
            <Calendar />
          </DynamicPickerWrapper>
        </Provider>
      )}

      {dynamicPicker === "year" && (
        <Provider
          mode={"date"}
          picker="year"
          onChange={(date) => {
            setDynamicPicker(null);
            setStartDate(date);
          }}
        >
          <DynamicPickerWrapper>
            <Calendar />
          </DynamicPickerWrapper>
        </Provider>
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
