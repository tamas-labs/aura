import { z } from 'zod';
import { cacheSchema } from '../utils/schema-cache';

/**
 * IANA timezone enum validation
 * Contains the most common timezone values
 */
export const TimeZoneZod = cacheSchema(() => {
    return z
        .enum([
            // Europe
            'Europe/Amsterdam',
            'Europe/Athens',
            'Europe/Berlin',
            'Europe/Brussels',
            'Europe/Bucharest',
            'Europe/Budapest',
            'Europe/Copenhagen',
            'Europe/Dublin',
            'Europe/Helsinki',
            'Europe/Istanbul',
            'Europe/Lisbon',
            'Europe/London',
            'Europe/Madrid',
            'Europe/Moscow',
            'Europe/Oslo',
            'Europe/Paris',
            'Europe/Prague',
            'Europe/Rome',
            'Europe/Stockholm',
            'Europe/Vienna',
            'Europe/Warsaw',
            'Europe/Zurich',
            // America
            'America/Anchorage',
            'America/Argentina/Buenos_Aires',
            'America/Bogota',
            'America/Caracas',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'America/Mexico_City',
            'America/New_York',
            'America/Phoenix',
            'America/Santiago',
            'America/Sao_Paulo',
            'America/Toronto',
            'America/Vancouver',
            // Asia
            'Asia/Bangkok',
            'Asia/Dhaka',
            'Asia/Dubai',
            'Asia/Hong_Kong',
            'Asia/Jakarta',
            'Asia/Jerusalem',
            'Asia/Karachi',
            'Asia/Kolkata',
            'Asia/Manila',
            'Asia/Seoul',
            'Asia/Shanghai',
            'Asia/Singapore',
            'Asia/Taipei',
            'Asia/Tokyo',
            // Australia
            'Australia/Adelaide',
            'Australia/Brisbane',
            'Australia/Darwin',
            'Australia/Melbourne',
            'Australia/Perth',
            'Australia/Sydney',
            // Pacific
            'Pacific/Auckland',
            'Pacific/Fiji',
            'Pacific/Honolulu',
            // Africa
            'Africa/Cairo',
            'Africa/Johannesburg',
            'Africa/Lagos',
            'Africa/Nairobi',
            // Atlantic
            'Atlantic/Azores',
            'Atlantic/Cape_Verde',
            // UTC
            'UTC',
        ])
        .nullable();
});
