import React, { useState, useEffect } from 'react';
import AdminCharts from './AdminCharts';
import ApiService from '../../api/ApiService';

const EMPTY_CHART_DATA = { labels: [], orders: [] };

const MonthlyProductsChart = ({ title } = {}) => {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(EMPTY_CHART_DATA);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await ApiService.getReportData('monthly-products', {});
            if (res.data.success) {
                setChartData(res.data.data);
            } else {
                setChartData(EMPTY_CHART_DATA);
            }
        } catch (error) {
            console.error('Failed to fetch monthly products data:', error);
            setChartData(EMPTY_CHART_DATA); // clear stale data on failure
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminCharts
            data={chartData}
            loading={loading}
            type="orders" // reuses the plain-number tooltip/axis format (not currency)
            showPeriodSelector={false}
            subtitle={`Units sold • Jan – Dec ${new Date().getFullYear()}`}
            title={title}
            unitLabel="units"
        />
    );
};

export default MonthlyProductsChart;