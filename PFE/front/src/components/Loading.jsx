import React from "react";
import { Spinner } from "react-bootstrap";
function Loading() {
  return (
    <div
      className="loading-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        zIndex: "5",
      }}
    >
      <Spinner animation="grow" />
    </div>
  );
}

export default Loading;
