import React, { memo, useMemo } from "react";
import styled, { css } from "styled-components";

import { IDateItem } from "../hooks/useCalendarParseDates";
import { ICalendarPickerType } from "./Calendar";

export type IPanelProps = {
  onClick?: (d: IDateItem) => void;
  onHover?: (d: IDateItem) => void;
  active: IDateItem[];
  before: IDateItem[];
  after: IDateItem[];
  dateCellFormat: (date: IDateItem) => number | string | undefined;
  picker: ICalendarPickerType;
};

const spliceIntoChunks = (arr: Array<IDateItem>, chunkSize: number) => {
  const res = [];
  while (arr.length > 0) {
    const chunk = arr.splice(0, chunkSize);
    res.push(chunk);
  }
  return res;
};

export const Panel = memo(
  ({ onClick, onHover, active, before, after, picker, dateCellFormat }: IPanelProps) => {
    const chunks = useMemo(
      () => spliceIntoChunks([...before, ...active, ...after], picker === "day" ? 7 : 3),
      [active, after, before, picker],
    );

    return (
      <DaysGrid>
        {chunks.map((chunk, index) => (
          <DaysGridRow key={index}>
            {chunk.map((day) => (
              <DaysCell
                as={day.isExternal ? "span" : "div"}
                key={day.value.valueOf()}
                $weekend={day.isWeekend}
                $external={day.isExternal}
                $disabled={day.isDisabled}
                onClick={() => onClick?.(day)}
                {...(day.isExternal
                  ? {}
                  : {
                      $today: day.isToday,
                      $active: day.isActive,
                      $between: day.isBetween,
                      onMouseEnter: () => onHover?.(day),
                    })}
              >
                <span>{dateCellFormat(day)}</span>
              </DaysCell>
            ))}
          </DaysGridRow>
        ))}
      </DaysGrid>
    );
  },
);

const DaysGridRow = styled.div`
  display: flex;
  width: 100%;
`;

export const DaysGrid = styled.div`
  display: flex;
  flex-direction: column;
`;


export const DaysCell = styled.div<
  Partial<{
    $weekend: boolean;
    $external: boolean;
    $active: boolean;
    $between: boolean;
    $disabled: boolean;
    $today: boolean;
  }>
>`
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  width: 100%;
  border: 1px solid Gainsboro;
  padding: 4px;

  &:hover {
    background-color: silver;
  }


  ${(p) =>
    p.$today &&
    css`
      color: DodgerBlue;
    `};

  ${(p) =>
    p.$weekend &&
    css`
      color: tomato;
    `};

  ${(p) =>
    p.$external &&
    css`
      text-decoration: line-through;
      color: silver;
    `};

  ${(p) =>
    p.$disabled &&
    css`
      color: grey;
      cursor: default;

      &:hover {
        background-color: initial;
      }
    `};

  ${(p) =>
    p.$between &&
    !p.$active &&
    css`
      background-color: #afafc7;
      position: relative;

      &:hover {
        background-color: #afafc7;
      }

      span {
        position: relative;
      }
    `};

  ${(p) =>
    p.$active &&
    css`
      color: #fff;
      background-color: blue;
      position: relative;
      z-index: 1;

      &:hover {
        background-color: blue;
      }
    `};
`;
