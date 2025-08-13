import React from 'react';
interface ForecastPoint {
    date: string;
    temperature: number;
    description: string;
    minTemperature: number;
    maxTemperature: number;
    icon: string;
}
interface ForecastChartProps {
    data: ForecastPoint[] | null;
    darkMode: boolean;
}
declare const ForecastChart: React.FC<ForecastChartProps>;
export default ForecastChart;
//# sourceMappingURL=ForecastChart.d.ts.map