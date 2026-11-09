// src/services/historyService.js
import { apiRequest } from './api.js';

const LOCAL_STORAGE_KEY = 'visiontype_test_history';
const MAX_LOCAL_RECORDS = 50;

/**
 * Saves a completed test result locally and attempts to sync it with the backend.
 * @param {Object} stats - Telemetry from the completed test (WPM, accuracy, errors, etc.)
 */
export async function recordTestResult(stats) {
    const record = {
        id: `test_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...stats
    };

    // 1. Always save to local browser storage first (Works for both Guests and Logged-In users)
    saveToLocalStorage(record);

    // 2. If an auth token exists, sync asynchronously with backend
    const token = localStorage.getItem('auth_token');
    if (token) {
        try {
            // Map your frontend stats object to match FastAPI's ScoreCreate schema
            const payload = {
                wpm: stats.wpm,
                raw_wpm: stats.rawWpm,
                accuracy: stats.accuracy,
                consistency: stats.consistency,
                time_elapsed: stats.timeElapsed,          // 👈 Added this so time_typing updates!
                chars_correct: stats.charsCorrect,
                chars_incorrect: stats.charsIncorrect,
                chars_extra: stats.charsExtra,
                chars_missed: stats.charsMissed,
                language: "english",
                dataset: stats.datasetName,  // 👈 Added this to match the new backend schema
                mode: String(stats.testMode),
                mode_info: String(stats.testLimit)  // 👈 Converted to a clean integer (e.g. 10, 60) instead of a string
            };

            await apiRequest('/api/scores', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            console.log('Test history successfully synced to Neon DB via FastAPI.');
        } catch (err) {
            console.warn('Backend sync failed (saved locally only):', err.message);
        }
    }

    return record;
}

/**
 * Retrieves all locally stored test history records.
 */
export function getLocalTestHistory() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('Failed to parse local test history from storage:', e);
        return [];
    }
}

/**
 * Helper to update localStorage and keep memory usage capped.
 */
export function saveToLocalStorage(record) {
    const history = getLocalTestHistory();
    history.unshift(record); // Prepend new test result so newest is first

    if (history.length > MAX_LOCAL_RECORDS) {
        history.pop(); // Drop oldest test beyond maximum limit
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
}