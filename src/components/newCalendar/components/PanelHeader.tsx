import { useMemo } from "react";
import styled from "styled-components";

import { IDateItem } from "../hooks/useCalendarParseDates";

export const PanelHeader = ({
  locale,
  monthsData,
}: {
  locale: string;
  monthsData: {
    before: IDateItem[];
    active: IDateItem[];
    after: IDateItem[];
  }[];
}) => {
  const weekDays = useMemo(() => {
    const days = [...monthsData[0].before, ...monthsData[0].active].slice(0, 7);
    return days.map((d) => ({
      label: d.value.toLocaleDateString(locale, { weekday: "short" }).charAt(0),
      id: d.value.valueOf(),
    }));
  }, [locale, monthsData]);

  return (
    <WeekDays>
      {weekDays.map((item) => (
        <WeekDay key={item.id}>{item.label}</WeekDay>
      ))}
    </WeekDays>
  );
};

const WeekDays = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(32px, 1fr));
  grid-gap: 4px;
  margin-bottom: 8px;
  align-items: center;
  justify-items: center;
  place-content: center;
  position: relative;
  min-height: 32px;
`;

const WeekDay = styled.div`
`;
