import React, { useEffect, useRef } from "react";
import DxfParser from "dxf-parser";

const DXFViewer = ({ dxfContent }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (dxfContent) {
      try {
        const parser = new DxfParser();
        const parsedData = parser.parseSync(dxfContent);

        // Rendering delle entità su canvas
        renderDXF(parsedData, canvasRef.current);
      } catch (error) {
        console.error("Errore durante il parsing del file DXF:", error);
      }
    }
  }, [dxfContent]);

  const renderDXF = (dxf, canvas) => {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Impossibile ottenere il contesto del canvas.");
      return;
    }

    // Imposta dimensioni canvas
    canvas.width = 1000;
    canvas.height = 600;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calcola i limiti del contenuto DXF
    const { minX, maxX, minY, maxY } = getDXFBounds(dxf);

    // Calcola la scala per adattare tutto al canvas
    const scale = getScale(minX, maxX, minY, maxY, canvas.width, canvas.height);

    // Calcola i margini per centrare il contenuto
    const marginX = (canvas.width - (maxX - minX) * scale) / 2;
    const marginY = (canvas.height - (maxY - minY) * scale) / 2;

    // Renderizza le entità con la scalatura applicata
    dxf.entities.forEach((entity) => {
      switch (entity.type) {
        case "LINE":
          renderLine(entity, ctx, scale, marginX, marginY, canvas);
          break;
        case "CIRCLE":
          renderCircle(entity, ctx, scale, marginX, marginY, canvas);
          break;
        case "ARC":
          renderArc(entity, ctx, scale, marginX, marginY, canvas);
          break;
        case "LWPOLYLINE":
          renderLWPolyline(entity, ctx, scale, marginX, marginY, canvas);
          break;
        case "TEXT":
          renderText(entity, ctx, scale, marginX, marginY, canvas);
          break;
        case "SPLINE":
          renderSpline(entity, ctx, scale, marginX, marginY, canvas);
          break;
        default:
          console.log(`Tipo di entità non supportato: ${entity.type}`);
      }
    });
  };

  const getDXFBounds = (dxf) => {
    let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;

    dxf.entities.forEach((entity) => {
      if (entity.type === "LINE") {
        entity.vertices.forEach((vertex) => {
          minX = Math.min(minX, vertex.x);
          maxX = Math.max(maxX, vertex.x);
          minY = Math.min(minY, vertex.y);
          maxY = Math.max(maxY, vertex.y);
        });
      } else if (entity.type === "CIRCLE") {
        const { x, y } = entity.center;
        const radius = entity.radius;
        minX = Math.min(minX, x - radius);
        maxX = Math.max(maxX, x + radius);
        minY = Math.min(minY, y - radius);
        maxY = Math.max(maxY, y + radius);
      } else if (entity.type === "ARC") {
        const { x, y } = entity.center;
        const radius = entity.radius;
        minX = Math.min(minX, x - radius);
        maxX = Math.max(maxX, x + radius);
        minY = Math.min(minY, y - radius);
        maxY = Math.max(maxY, y + radius);
      } else if (entity.type === "LWPOLYLINE") {
        entity.vertices.forEach((vertex) => {
          minX = Math.min(minX, vertex.x);
          maxX = Math.max(maxX, vertex.x);
          minY = Math.min(minY, vertex.y);
          maxY = Math.max(maxY, vertex.y);
        });
      } else if (entity.type === "TEXT") {
        const { x, y } = entity;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      } else if (entity.type === "SPLINE") {
        entity.controlPoints.forEach((point) => {
          minX = Math.min(minX, point.x);
          maxX = Math.max(maxX, point.x);
          minY = Math.min(minY, point.y);
          maxY = Math.max(maxY, point.y);
        });
      }
    });

    return { minX, maxX, minY, maxY };
  };

  const getScale = (minX, maxX, minY, maxY, canvasWidth, canvasHeight) => {
    const width = maxX - minX;
    const height = maxY - minY;
    const scaleX = canvasWidth / width;
    const scaleY = canvasHeight / height;
    return Math.min(scaleX, scaleY); // Mantieni il contenuto proporzionato
  };

  const renderLine = (entity, ctx, scale, marginX, marginY, canvas) => {
    const { x: x1, y: y1 } = entity.vertices[0];
    const { x: x2, y: y2 } = entity.vertices[1];

    // Applica la scalatura e i margini
    ctx.beginPath();
    ctx.moveTo(x1 * scale + marginX, (canvas.height - (y1 * scale + marginY))); // Inverto l'asse Y
    ctx.lineTo(x2 * scale + marginX, (canvas.height - (y2 * scale + marginY)));
    ctx.stroke();
  };

  const renderCircle = (entity, ctx, scale, marginX, marginY, canvas) => {
    const { x, y } = entity.center;
    const radius = entity.radius;

    // Applica la scalatura e i margini
    ctx.beginPath();
    ctx.arc(x * scale + marginX, canvas.height - (y * scale + marginY), radius * scale, 0, Math.PI * 2, false); // Inverto l'asse Y
    ctx.stroke();
  };

  const renderArc = (entity, ctx, scale, marginX, marginY, canvas) => {
    const { x, y } = entity.center;
    const radius = entity.radius;
    const startAngle = entity.startAngle * (Math.PI / 180); // Converti in radianti
    const endAngle = entity.endAngle * (Math.PI / 180); // Converti in radianti

    // Applica la scalatura e i margini
    ctx.beginPath();
    ctx.arc(x * scale + marginX, canvas.height - (y * scale + marginY), radius * scale, startAngle, endAngle, false); // Inverto l'asse Y
    ctx.stroke();
  };

  const renderLWPolyline = (entity, ctx, scale, marginX, marginY, canvas) => {
    ctx.beginPath();
    entity.vertices.forEach((vertex, index) => {
      const { x, y } = vertex;
      if (index === 0) {
        ctx.moveTo(x * scale + marginX, canvas.height - (y * scale + marginY)); // Inverto l'asse Y
      } else {
        ctx.lineTo(x * scale + marginX, canvas.height - (y * scale + marginY));
      }
    });
    ctx.closePath();
    ctx.stroke();
  };

  const renderText = (entity, ctx, scale, marginX, marginY, canvas) => {
    const { x, y, text } = entity;

    // Applica la scalatura e i margini
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(text, x * scale + marginX, canvas.height - (y * scale + marginY)); // Inverto l'asse Y
  };

  const renderSpline = (entity, ctx, scale, marginX, marginY, canvas) => {
    const { controlPoints } = entity;

    if (controlPoints.length < 2) {
      console.log("Spline non valida: troppo pochi punti di controllo.");
      return;
    }

    // Rendering semplificato della SPLINE (approssimazione lineare tra i punti di controllo)
    ctx.beginPath();
    controlPoints.forEach((point, index) => {
      const { x, y } = point;
      if (index === 0) {
        ctx.moveTo(x * scale + marginX, canvas.height - (y * scale + marginY)); // Inverto l'asse Y
      } else {
        ctx.lineTo(x * scale + marginX, canvas.height - (y * scale + marginY));
      }
    });
    ctx.stroke();
  };

  return <canvas ref={canvasRef}></canvas>;
};

export default DXFViewer;