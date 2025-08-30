import fetch from 'node-fetch';
import Place from '../models/place.model';

interface Venue {
    venue_id: string;
    venue_name: string;
    venue_type: string;
    venue_address: string;
    venue_lat: number;
    venue_lng: number;
    rating: number;
    reviews: number;
    price_level?: number;
    day_info: {
        day_int: number;
    };
    day_raw: number[];
}

interface BestTimeResponse {
    venues: Venue[];
    status: string;
    message?: string;
}

interface ValidateApiKeyReponse {
    active: boolean;
    api_key_private: string;
    api_key_public: string;
    credits_forecast: number;
    credits_query: number;
    status: string;
    valid: boolean
}

/**
 * Fetches api information in BestTime API
 */
export async function validateApiKey(): Promise<ValidateApiKeyReponse> {
   const response = await fetch(
        `https://besttime.app/api/v1/keys/pri_1800b36a1c114fe5b410c26345f6bea8`, {
            method: 'GET'
        });
   return await response.json() as ValidateApiKeyReponse

}

/**
 * Fetches places from BestTime API or returns mock data
 * @param area The area to search in (e.g., 'Warsaw')
 * @param types Comma-separated list of venue types (e.g., 'BAR,CLUBS,CAFE')
 * @param limit Maximum number of results to return (default: 10)
 * @param mockData Whether to use mock data (default: true)
 */
export async function getPlacesFromBestTime(
    area: {lat: number, lng: number},
    types: string,
    limit: number = 10,
    mockData: boolean = false
): Promise<void> {
    let response: BestTimeResponse;

    const BESTTIME_KEY = process.env.BESTTIME_KEY;

    if (mockData || !BESTTIME_KEY) {
        console.log('ℹ️  Using mock data');
        response = mockPlaces();
    } else {
        try {
            const params = new URLSearchParams({
                    'api_key_private': BESTTIME_KEY.toString(),
                    'types': types.toString(),
                    'lat': area.lat.toString(),
                    'lng': area.lng.toString(),
                    'radius': '6000',
                    'busy_min': '1',
                    'rating_min': '3',
                    'reviews_min': '30',
                    'limit': limit.toString()
                }
            );
            const fetchResponse = await fetch(`https://besttime.app/api/v1/venues/filter?${params}`, {
                method: 'GET'
            })

            if (!fetchResponse.ok) {
                throw new Error(`API request failed with status ${fetchResponse.status}`);
            }

            response = await fetchResponse.json() as BestTimeResponse;
        } catch (error) {
            throw error;
        }
    }

    if (!response.venues || !Array.isArray(response.venues)) {
        throw new Error('Invalid response from BestTime API');
    }

    try {
        await processVenuesWithConcurrency(response.venues, 5);
    } catch (error) {
        console.error('❌ Error processing venues:', error);
    }
}

async function processVenuesWithConcurrency(venues: Venue[], concurrency = 5) {
    const results = [];

    for (let i = 0; i < venues.length; i += concurrency) {
        const batch = venues.slice(i, i + concurrency);

        const batchPromises = batch.map(async (venue) => {
            try {
                const dayInt = venue.day_info.day_int;
                const venueId = venue.venue_id;

                await Place.updateOne(
                    { placeId: venueId },
                    { $pull: { busyTimes: { day: dayInt } } }
                );

                const updateData = {
                    $set: {
                        placeId: venueId,
                        name: venue.venue_name,
                        type: venue.venue_type,
                        address: venue.venue_address,
                        rating: venue.rating,
                        reviews: venue.reviews,
                        priceLevel: venue.price_level,
                        "location.lat": venue.venue_lat,
                        "location.lng": venue.venue_lng,
                        updatedAt: new Date(),
                    },
                    $push: {
                        busyTimes: {
                            day: dayInt,
                            hours: venue.day_raw
                        }
                    },
                    $setOnInsert: {
                        createdAt: new Date()
                    }
                };

                await Place.findOneAndUpdate(
                    { placeId: venueId },
                    updateData,
                    { upsert: true, new: true }
                );

                return { success: true, venue: venue.venue_name };
            } catch (error) {
                return { success: false, venue: venue.venue_name, error };
            }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        if (i + concurrency < venues.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
}

function mockPlaces(): BestTimeResponse {
    console.log('🔧 Using mock data');
    return {
        status: 'OK',
        venues: [
            {
                venue_id: 'warsaw-001',
                venue_name: 'Museu Cubano Warsaw',
                venue_type: 'BAR',
                venue_address: 'Aleksandra Fredry 6, Warsaw',
                venue_lat: 52.2421,
                venue_lng: 21.0098,
                rating: 3.8,
                reviews: 2500,
                price_level: 2,
                day_info: { day_int: Math.floor(Math.random() * 7) },
                day_raw: Array(24).fill(0).map((_, i) => {
                    const value = 50 + Math.sin(i / 24 * Math.PI * 2) * 40;
                    return Math.min(100, Math.max(0, Math.round(value)));
                })
            },
            {
                venue_id: 'warsaw-002',
                venue_name: 'Zielona Gęś',
                venue_type: 'BAR',
                venue_address: 'al. Niepodległości 177, Warsaw',
                venue_lat: 52.2102,
                venue_lng: 21.0066,
                rating: 4.2,
                reviews: 1800,
                price_level: 2,
                day_info: { day_int: Math.floor(Math.random() * 7) },
                day_raw: Array(24).fill(0).map((_, i) => {
                    const value = 50 + Math.sin(i / 24 * Math.PI * 2) * 40;
                    return Math.min(100, Math.max(0, Math.round(value)));
                })
            },
            {
                venue_id: 'warsaw-003',
                venue_name: 'PiwPaw Beer Heaven',
                venue_type: 'BEER',
                venue_address: 'Foksal 16, Warsaw',
                venue_lat: 52.2341,
                venue_lng: 21.0203,
                rating: 4.5,
                reviews: 3000,
                price_level: 2,
                day_info: { day_int: Math.floor(Math.random() * 7) },
                day_raw: Array(24).fill(0).map((_, i) => {
                    const value = 50 + Math.sin(i / 24 * Math.PI * 2) * 40;
                    return Math.min(100, Math.max(0, Math.round(value)));
                })
            }
        ]
    };
}