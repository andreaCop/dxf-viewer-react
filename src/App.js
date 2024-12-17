import React, { useState, useEffect } from "react";
import DXFViewer from "./DXFViewer";

const App = () => {
  const [dxfContent, setDxfContent] = useState(null);

  useEffect(() => {
    const loadDXF = async () => {
      try {
        console.log("Caricamento del file DXF...");
        const response = await fetch("/example.dxf");
        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        console.log("File DXF caricato con successo:", text);
        setDxfContent(text);
      } catch (error) {
        console.error("Errore nel caricamento del file DXF:", error);
      }
    };
  
    loadDXF();
  }, []);

  return (
    <div>
      <h1>DXF Viewer</h1>
      {dxfContent ? <DXFViewer dxfContent={dxfContent} /> : "Caricamento del file DXF..."}
    </div>
  );
};

export default App;