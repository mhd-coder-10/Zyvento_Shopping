
// src/utils/useSettings.js
import { useState, useEffect } from 'react';
import ApiService from '../api/ApiService';


export const useSettings = (group) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            // ✅ Full path: /admin/settings/group/:group
            const res = await ApiService.get(`/admin/settings/group/${group}`);
            if (res.data.success) {
                const mapped = {};
                res.data.data.forEach(item => {
                    mapped[item.key] = item.value;
                });
                setSettings(mapped);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [group]);

    const updateSettings = async (newSettings) => {
        try {
            // ✅ Bulk update endpoint
            const res = await ApiService.put(`/admin/settings/group/${group}`, {
                settings: newSettings
            });
            if (res.data.success) {
                setSettings(newSettings);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update settings:', error);
            return false;
        }
    };

    return { settings, loading, updateSettings, refetch: fetchSettings };
};