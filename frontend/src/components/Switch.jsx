import React from "react";
import "../styles/Switch.css";

const Switch = ({ checked, onChange, name }) => {
  return (
    <label className="custom-switch">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
      />
      <span className="slider" />
    </label>
  );
};

export default Switch;