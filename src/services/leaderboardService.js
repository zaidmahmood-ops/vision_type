// src/services/leaderboardService.js
import { apiRequest } from './api.js';

// Client-side cache (lives in browser memory while the app is open)
const clientCache = {};
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes, matches the server cache

export async function fetchLeaderboardData(mode = 'time', modeInfo = '60') {
  const cacheKey = `${mode}_${modeInfo}`;
  const cached = clientCache[cacheKey];

  // Return cached data only if it's still fresh
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    // api.js already prepends http://localhost:8000/api, so only pass /leaderboard
    const params = new URLSearchParams({ mode, mode_info: modeInfo });
    const data = await apiRequest(`/leaderboard?${params.toString()}`);

    clientCache[cacheKey] = { data, timestamp: Date.now() };
    return data;
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    throw error;
  }
}