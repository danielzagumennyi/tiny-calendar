import { format } from "date-fns";
import { ReactNode, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Context } from "../../context/context";

import {
  Calendar,
  ICalendarProps as IGeneralCalendarProps,
  IPeriodPreset,
} from "./components/Calendar";
import { useStore } from "./hooks/useStore";
import { sortDates } from "./utils/utils";

export type {
  ICalendarHoverRangeType,
  ICalendarPickerType,
  IPeriodPreset,
} from "./components/Calendar";

export type ICalendarProps = IGeneralCalendarProps;

export const NewCalendar = (props: ICalendarProps) => {
  const value = useStore(props)
  return (
    <Context.Provider value={value}>
      <Calendar {...props} />
    </Context.Provider>
  );
};

