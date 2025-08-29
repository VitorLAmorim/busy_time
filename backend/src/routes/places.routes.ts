import { Router, Request, Response } from 'express';
import Place from '../models/place.model';
import {getPlacesFromBestTime, validateApiKey} from "../services/bestTime.service";

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
            page = '1',
            limit = '20',
            sortBy = 'name',
            sortOrder = 'asc'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

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

        if (minRating) {
            query.rating = { $gte: parseFloat(minRating as string) };
        }

        if (minReviews) {
            query.reviews = { $gte: parseInt(minReviews as string) };
        }

        if (priceLevel) {
            query.priceLevel = parseInt(priceLevel as string);
        }

        if (type) {
            const typesArray = (type as string).split(',');
            query.type = { $in: typesArray };
        }

        let projection: any = {};

        if(queryFields) {
            const fieldsArray = (queryFields as string).split(',');
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
                .limit(limitNum)
                .lean(),

            Place.countDocuments(query)
        ]);

        res.json({
            places,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        })

    } catch (error) {
        res.status(500).json({ error: 'Erro na busca de lugares' });
    }
});



router.get('/updateData', async (req: Request, res: Response) => {
    try {
        await getPlacesFromBestTime({lat: 52.23001379469755, lng: 21.011590957893365}, 'BAR,CLUBS,CAFE');
        const places = await Place.find();
        res.json(places);
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



export default router;