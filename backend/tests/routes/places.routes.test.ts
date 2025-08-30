import request from 'supertest';
import express from 'express';
import placesRouter from '../../src/routes/places.routes';
import Place from '../../src/models/place.model';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const app = express();
app.use(express.json());
app.use('/api/places', placesRouter);

const mockPlace = {
    location: {
        lat: 52.2247013,
        lng: 21.0078185
    },
    __v: 0,
    address: "Hoża 61 00-681 Warszawa Poland",
    busyTimes: [
        {
            day: 5,
            hours: [
                0, 0, 0, 0, 0, 0, 25, 40, 50, 55, 65, 70, 75, 80, 80, 80, 75, 70, 55, 40, 20, 0, 0, 0
            ],
            _id: "68b24462a5ba7c9dfca515ca"
        }
    ],
    createdAt: "2025-08-29T22:35:32.924Z",
    name: "Bar Pacyfik",
    priceLevel: 2,
    rating: 4.5,
    reviews: 3401,
    type: "BAR",
    updatedAt: "2025-08-30T00:22:58.083Z"
};

function generateMockPlace() {
    const placeId = `ven_${Math.floor(Math.random() * 1000000)}`;
    return {
        ...mockPlace,
        placeId
    }

}

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: "test" });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Places Routes', () => {
    beforeEach(async () => {
        await Place.deleteMany({});
    });

    describe('GET /api/places', () => {
        it('should return empty array when no places exist', async () => {
            const res = await request(app)
                .get('/api/places')
                .expect(200);

            expect(res.body).toHaveProperty('places');
            expect(res.body.places).toHaveLength(0);
        });

        it('should return places with pagination', async () => {
            await Place.create([
                { ...generateMockPlace(), name: 'Test Place 1', type: 'BAR' },
                { ...generateMockPlace(), name: 'Test Place 2', type: 'CAFE' }
            ]);

            const res = await request(app)
                .get('/api/places?page=1&limit=1')
                .expect(200);

            expect(res.body).toHaveProperty('places');
            expect(res.body.places).toHaveLength(1);
            expect(res.body.pagination).toEqual({
                page: 1,
                limit: 1,
                total: 2,
                pages: 2
            });
        });
    });

    describe('GET /api/places/updateData', () => {
        it('should update places with mock data', async () => {
            const res = await request(app)
                .get('/api/places/updateData?mockData=true&limit=2')
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Places updated successfully');
            const places = await Place.find({});
            expect(places.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('GET /api/places/validateKey', () => {
        it('should validate API key and return key info', async () => {
            const res = await request(app)
                .get('/api/places/validateKey')
                .expect(200);

            expect(res.body).toHaveProperty('status');
            expect(res.body).toHaveProperty('valid');
        });
    });

    describe('GET /api/places/:id', () => {

        it('should return a place by id', async () => {
            const place = await Place.create({ ...generateMockPlace(), name: 'Unique Place', type: 'BAR', placeId: 'unique-123' });
             const res = await request(app)
                .get(`/api/places/${place.placeId}`)
                .expect(200);

            expect(res.body).toHaveProperty('placeId',place.placeId);
            expect(res.body).toHaveProperty('name', 'Unique Place');
        });

        it('should return 404 if place not found', async () => {
            const res = await request(app)
                .get('/api/places/nonexistent-id')
                .expect(404);

            expect(res.body).toHaveProperty('error', 'Venue not found');
        });
    });

});