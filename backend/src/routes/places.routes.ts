import { Router, Request, Response } from 'express';
import Place from '../models/place.model';
import {getPlacesFromBestTime, validateApiKey} from "../services/bestTime.service";
import {parse} from "dotenv";

const router = Router();

// Get all venues
router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            queryFields,
            name,
            address,
            minRating,
            minReviews,
            priceLevel,
            type,
            page,
            limit,
            sortBy,
            sortOrder,
            skip
        } = parseSearchQuery(req.query);

        let query: any = {};
        let sortOptions: any = {};

        const hasTextSearch = !!(name || address);

        if (hasTextSearch) {
            query.$text = {
                $search: `${name || ''} ${address || ''}`.trim()
            };
            sortOptions.score = { $meta: 'textScore' };
        } else {
            sortOptions[sortBy as string] =  sortOrder === 'asc' ? 1 : -1;
        }

        if (minRating !== undefined) {
            query.rating = { $gte: minRating };
        }

        if (minReviews !== undefined) {
            query.reviews = { $gte: minReviews };
        }

        if (priceLevel !== undefined) {
            query.priceLevel = priceLevel;
        }

        if (type) {
            query.type = { $in: type };
        }


        let projection: any = {};

        if(queryFields) {
            const fieldsArray = queryFields.split(',');
            fieldsArray.forEach(field => {
                projection[field.trim()] = 1;
            });

            projection._id = 0;
            projection.placeId = 1;
        }

        const [places, total] = await Promise.all([
            Place.find(query)
                .select(projection)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),

            Place.countDocuments(query)
        ]);

        res.json({
            places,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        res.status(500).json({ error: 'Erro na busca de lugares' });
    }
});



router.get('/updateData', async (req: Request, res: Response) => {
    try {
        const { limit, mockData, types, lat, lng } = parseUpdateQuery(req.query);

        await getPlacesFromBestTime({ lat, lng }, types, limit, mockData);
        res.json({ message: 'Places updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching venues' });
    }
});

router.get('/validateKey', async (req: Request, res: Response) => {
    try {
        const keyInfo = await validateApiKey();
        res.json(keyInfo);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching venues' });
    }
});


router.get('/:id', async (req: Request, res: Response) => {
    try {
        const venue = await Place.findOne({ placeId: req.params.id });
        if (!venue) {
            return res.status(404).json({ error: 'Venue not found' });
        }
        res.json(venue);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching venue' });
    }
});



function parseUpdateQuery<T>(query: any): {
    limit: number;
    mockData: boolean;
    types: string;
    lat: number;
    lng: number;
} {
    return {
        limit: query.limit ? parseInt(query.limit) : 10,
        mockData: query.mockData === "true",
        types: query.types || "BAR,CLUBS,CAFE",
        lat: query.lat ? parseFloat(query.lat) : 52.2300137946975,
        lng: query.lng ? parseFloat(query.lng) : 21.011590957893365,
    };
}

function parseSearchQuery(query: any) {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;

    return {
        queryFields: query.queryFields as string | undefined,
        name: query.name as string | undefined,
        address: query.address as string | undefined,
        minRating: query.minRating ? parseFloat(query.minRating) : undefined,
        minReviews: query.minReviews ? parseInt(query.minReviews) : undefined,
        priceLevel: query.priceLevel ? parseInt(query.priceLevel) : undefined,
        type: query.type ? (query.type as string).split(",") : undefined,
        page,
        limit,
        sortBy: (query.sortBy as string) || "name",
        sortOrder: query.sortOrder === "desc" ? "desc" : "asc",
        skip: (page - 1) * limit,
    };
}




export default router;