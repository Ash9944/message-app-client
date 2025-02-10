import React, { useState, useEffect } from "react";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import RouterConfig from "./Routes";
import './styles.css';

const App = () => {
  const [screenHeight, setScreenHeight] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(null);
  const [footerHeight, setFooterHeight] = useState(null);

  const handleResize = () => {
    const headerHeight = document.getElementById('header').offsetHeight;
    const footerHeight = document.getElementById('footer').offsetHeight;
    const bodyHeight = window.innerHeight - (headerHeight - footerHeight) + 8;
    setScreenHeight(bodyHeight);
    setHeaderHeight(headerHeight);
    setFooterHeight(footerHeight);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      return window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="App">
        <Header />
        <div className="section" id="section" style={{ 'minHeight': screenHeight }} >
          {<RouterConfig />}
        </div>
        <Footer />
    </div>
  )
}

export default App
