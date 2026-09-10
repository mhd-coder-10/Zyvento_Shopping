

import React from 'react';
import AdminCharts from './AdminCharts';

const MonthlyRevenueChart = ({ data, title, loading: propLoading } = {}) => {
    // Backend 'monthly-revenue' returns { labels, revenue }.
    // Some callers pass { labels, values }. Support both.
    const rawValues = data?.revenue ?? data?.values ?? [];

    const hasData =
        !!data &&
        Array.isArray(data.labels) &&
        data.labels.length > 0 &&
        Array.isArray(rawValues);

    const chartData = hasData
        ? {
            labels: data.labels,
            // normalize to numbers so bar heights are exact
            revenue: rawValues.map((v) => Number(v) || 0),
        }
        : { labels: [], revenue: [] };

    const loading = propLoading !== undefined ? propLoading : !hasData;

    return (
        <AdminCharts
            data={chartData}
            loading={loading}
            type="revenue"
            showPeriodSelector={false}
            subtitle={`Jan – Dec ${new Date().getFullYear()}`}
            title={title || 'Revenue Overview'}
            metricLabel="Revenue"
            yAxisStep={25000}
        />
    );
};

export default MonthlyRevenueChart;

