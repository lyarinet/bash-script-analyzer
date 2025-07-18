import React, { useEffect, useRef, useState } from 'react';

interface MermaidChartProps {
  chart: string;
}

const ZoomControls: React.FC<{ onZoomIn: () => void; onZoomOut: () => void; onZoomReset: () => void; }> = ({ onZoomIn, onZoomOut, onZoomReset }) => (
    <div className="absolute top-6 right-6 z-10 bg-gray-900/70 backdrop-blur-sm p-1 rounded-md flex items-center gap-1 border border-gray-600">
        <button onClick={onZoomOut} title="Zoom Out" className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
        </button>
        <button onClick={onZoomReset} title="Reset Zoom" className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a1 1 0 00-1 1v4a1 1 0 102 0V5h3a1 1 0 100-2H4zm12 0a1 1 0 00-1-1h-4a1 1 0 100 2h3v3a1 1 0 102 0V4a1 1 0 00-1-1zM4 17a1 1 0 001-1v-4a1 1 0 10-2 0v3a1 1 0 001 1zm12 0a1 1 0 001-1v-4a1 1 0 10-2 0v3h-3a1 1 0 100 2h4a1 1 0 001-1z" clipRule="evenodd" /></svg>
        </button>
        <button onClick={onZoomIn} title="Zoom In" className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
        </button>
    </div>
);

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let isMounted = true;
    
    import('mermaid').then(mermaid => {
      if (!isMounted) return;
      
      mermaid.default.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        flowchart: {
            useMaxWidth: false, // Set to false to allow scaling
            htmlLabels: true,
        },
        themeVariables: {
            background: "#1f2937", // bg-gray-800
            primaryColor: "#374151", // bg-gray-700
            primaryTextColor: "#d1d5db", // text-gray-300
            lineColor: "#6b7280", // border-gray-500
            nodeBorder: '#818cf8', // indigo-400
            mainBkg: '#818cf8', // indigo-400
            actorBorder: '#818cf8',
        }
      });

      const renderChart = async () => {
        if (!containerRef.current) return;
        setIsLoading(true);
        setError(null);
        containerRef.current.innerHTML = '';
        try {
          if (chart && chart.trim().length > 0) {
              const { svg } = await mermaid.default.render('mermaid-svg-' + Date.now(), chart);
              if (isMounted && containerRef.current) {
                  containerRef.current.innerHTML = svg;
              }
          } else {
              if (isMounted) setError("No flowchart data provided by the API.");
          }
        } catch (e: any) {
            console.error("Mermaid rendering error:", e.message);
            if (isMounted) setError(`Failed to render flowchart: ${e.message}`);
        } finally {
            if (isMounted) setIsLoading(false);
        }
      };

      renderChart();
    });

    return () => {
      isMounted = false;
    };
  }, [chart]);

  const handleZoomIn = () => setZoom(z => z * 1.25);
  const handleZoomOut = () => setZoom(z => z / 1.25);
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 min-h-[400px] flex flex-col relative">
      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onZoomReset={handleZoomReset} />
      <div className="w-full h-full flex-grow overflow-auto rounded-md bg-gray-900/50 p-2">
        {isLoading && <div className="flex items-center justify-center h-full text-gray-400">Loading chart...</div>}
        {error && <div className="flex items-center justify-center h-full text-red-400 text-center p-4">{error}</div>}
        <div 
            ref={containerRef} 
            className="flex justify-center items-center transition-transform duration-200 ease-in-out"
            style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                width: '100%',
                height: '100%',
                display: isLoading || error ? 'none' : 'flex'
            }}
        />
      </div>
    </div>
  );
};

export default MermaidChart;
