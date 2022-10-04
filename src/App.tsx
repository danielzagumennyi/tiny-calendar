import { useMemo, useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { useStore } from './components/newCalendar/hooks/useStore'
import { NewCalendar } from './components/newCalendar/NewCalendar'
import { Context } from './context/context'

const GlobalStyles = createGlobalStyle`
  body, html {
    height: 100%;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  *, *::after*::before {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

`

function App() {
  return (
    <div>
      <GlobalStyles />
      <BaseExample />
    </div>
  )
}


const BaseExample = () => {

  const store = useStore()

  const prevButton = useMemo(() => {
    return (
      <LeftButton
        onClick={store.handlePrev}
      >
        &larr;
        </LeftButton>
    );
  }, [store.handlePrev]);

  const nextButton = useMemo(() => {
    return (
      <RightButton  onClick={store.handleNext}
      
      >
        &rarr;
        </RightButton>
    );
  }, [store.handleNext]);


  return <Context.Provider value={value}>
    <NewCalendar />
  </Context.Provider>
}


const LeftButton = styled.div`
`;

const RightButton = styled.div`
 `;

export default App
