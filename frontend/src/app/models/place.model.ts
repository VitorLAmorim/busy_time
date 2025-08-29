export interface BusyTime {
    day: number;
    hours: number[];
}

export interface Place {
  placeId: string;
    name: string;
    type: string;
    address: string;
    rating: number;
    reviews: number;
    priceLevel?: number;
    location: { lat: number; lng: number };
    busyTimes: BusyTime[];
    updatedAt: string;
}

export enum PlaceType {
    BAR = 'BAR',
    CLUB = 'CLUBS',
    CAFE = 'CAFE'
}
