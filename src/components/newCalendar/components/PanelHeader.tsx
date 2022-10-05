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
  display: flex;
  text-align: center;
`;

const WeekDay = styled.div`
  flex: 1;
`;
