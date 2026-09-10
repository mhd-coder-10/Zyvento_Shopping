import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    FiBell,
    FiMail,
    FiPhone,
    FiGlobe,
    FiShield,
    FiLock,
    FiSave,
    FiCheck
} from 'react-icons/fi';
import ApiService from '../../api/ApiService';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // ✅ Default preferences
    const defaultPreferences = {
        notifications: { email: true, push: true, sms: false },
        language: 'en',
        timezone: 'UTC',
        theme: 'light',
    };
    
    const defaultNotificationTypes = {
        order_updates: true,
        promotions: false,
        reminders: true,
        seller_messages: true,
        review_requests: true,
    };

    const [preferences, setPreferences] = useState(defaultPreferences);
    const [notificationTypes, setNotificationTypes] = useState(defaultNotificationTypes);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        setLoading(true);
        try {
            const response = await ApiService.getNotificationPreferences();
            
            console.log('📦 API Response:', response.data);

            if (response.data?.success) {
                const data = response.data.data || {};
                
                setPreferences({
                    notifications: data.notifications || defaultPreferences.notifications,
                    language: data.language || 'en',
                    timezone: data.timezone || 'UTC',
                    theme: data.theme || 'light',
                });
                
                if (data.notification_types) {
                    setNotificationTypes(data.notification_types);
                }
            }
        } catch (error) {
            // ✅ If 422, use defaults (no toast for load error)
            if (error.response?.status === 422) {
                console.log('⚠️ No preferences found, using defaults');
                setPreferences(defaultPreferences);
                setNotificationTypes(defaultNotificationTypes);
            } else {
                toast.error(error.response?.data?.message || 'Failed to load settings');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                notifications: {
                    email: !!preferences.notifications.email,
                    push: !!preferences.notifications.push,
                    sms: !!preferences.notifications.sms,
                },
                notification_types: {
                    order_updates: !!notificationTypes.order_updates,
                    promotions: !!notificationTypes.promotions,
                    reminders: !!notificationTypes.reminders,
                    seller_messages: !!notificationTypes.seller_messages,
                    review_requests: !!notificationTypes.review_requests,
                },
                language: preferences.language || 'en',
                timezone: preferences.timezone || 'UTC',
                theme: preferences.theme || 'light',
            };

            console.log('📤 Sending payload:', payload);

            const response = await ApiService.updateNotificationPreferences(payload);

            if (response.data?.success) {
                toast.success('Settings saved successfully!');
            }
        } catch (error) {
            console.error('❌ Save error:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const languages = [
        { value: 'en', label: 'English' },
        { value: 'hi', label: 'Hindi' },
        { value: 'te', label: 'Telugu' },
        { value: 'ta', label: 'Tamil' },
        { value: 'bn', label: 'Bengali' },
    ];

    const timezones = [
        { value: 'UTC', label: 'UTC' },
        { value: 'IST', label: 'IST (UTC+5:30)' },
        { value: 'EST', label: 'EST (UTC-5)' },
        { value: 'PST', label: 'PST (UTC-8)' },
    ];

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-6 h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">Manage your preferences and notifications</p>
            </div>

            <div className="space-y-6">
                {/* Notification Channels */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
                    <div className="space-y-3">
                        {[
                            { key: 'email', icon: <FiMail />, label: 'Email Notifications' },
                            { key: 'push', icon: <FiBell />, label: 'Push Notifications' },
                            { key: 'sms', icon: <FiPhone />, label: 'SMS Notifications' },
                        ].map(({ key, icon, label }) => (
                            <label key={key} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!preferences.notifications[key]}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        notifications: { ...preferences.notifications, [key]: e.target.checked }
                                    })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-gray-700">{icon} {label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Notification Types */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Notify</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { key: 'order_updates', label: 'Order Updates' },
                            { key: 'promotions', label: 'Promotions & Deals' },
                            { key: 'reminders', label: 'Reminders' },
                            { key: 'seller_messages', label: 'Seller Messages' },
                            { key: 'review_requests', label: 'Review Requests' },
                        ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!notificationTypes[key]}
                                    onChange={(e) => setNotificationTypes({
                                        ...notificationTypes,
                                        [key]: e.target.checked
                                    })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Language & Timezone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FiGlobe /> Language
                        </h4>
                        <select
                            value={preferences.language || 'en'}
                            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {languages.map((lang) => (
                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FiShield /> Timezone
                        </h4>
                        <select
                            value={preferences.timezone || 'UTC'}
                            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            {timezones.map((tz) => (
                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Theme */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
                    <div className="flex gap-4">
                        {[
                            { key: 'light', label: 'Light' },
                            { key: 'dark', label: 'Dark' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setPreferences({ ...preferences, theme: key })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                    preferences.theme === key
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {key === 'light' ? '☀️' : '🌙'}
                                {label}
                                {preferences.theme === key && <FiCheck className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Privacy */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h3>
                    <div className="space-y-3">
                        <button 
                            onClick={() => window.location.href = '/profile#change-password'}
                            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            <FiLock /> Change Password
                        </button>
                        <button className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            <FiShield /> Privacy Settings
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        <FiSave />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;