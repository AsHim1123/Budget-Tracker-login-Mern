import React from "react";
import "./Spinner.css";

const Spinner = () => {
  return (
    <div className='spinner-container'>
      <div className='spinner' role='status'></div>
    </div>
  );
};

export default Spinner;
