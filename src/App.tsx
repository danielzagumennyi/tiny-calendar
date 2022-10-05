import { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Calendar } from "./components/newCalendar/components/Calendar";
import { Provider } from "./context/context";

const GlobalStyles = createGlobalStyle`
  body, html {
    height: 100%;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  body {
    padding: 24px;
  }

  *, *::after, *::before {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
`;

function App() {
  const [value, setValue] = useState<Date[] | null | undefined>();
  return (
    <div>
      <GlobalStyles />
      <div>{JSON.stringify(value)}</div>
      <Provider value={value} onChange={setValue} columns={2} rows={2}>
        <BaseExample />
      </Provider>
    </div>
  );
}

const BaseExample = () => {
  return <Calendar />;
};

export default App;
