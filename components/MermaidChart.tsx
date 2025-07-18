
import React, { useEffect, useRef, useState } from 'react';

interface MermaidChartProps {
  chart: string;
}

const MermaidChart: React.FC<MermaidChartProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    import('mermaid').then(mermaid => {
      if (!isMounted) return;
      
      mermaid.default.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        flowchart: {
            useMaxWidth: true,
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
        try {
          // Check if chart definition is not empty
          if (chart && chart.trim().length > 0) {
              const { svg } = await mermaid.default.render('mermaid-svg-' + Date.now(), chart);
              if (isMounted && containerRef.current) {
                  containerRef.current.innerHTML = svg;
                  setError(null);
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

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 min-h-[200px] flex justify-center items-center">
      {isLoading && <div className="text-gray-400">Loading chart...</div>}
      {error && <div className="text-red-400 text-center">{error}</div>}
      <div ref={containerRef} className="w-full h-full flex justify-center items-center [&>svg]:max-w-full [&>svg]:max-h-[600px]" />
    </div>
  );
};

export default MermaidChart;
