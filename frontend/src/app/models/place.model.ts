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
    lastSearchDay?: number;
    lastSearchDayOpenTime?: number;
    lastSearchDayCloseTime?: number;
    location: { lat: number; lng: number };
    busyTimes: BusyTime[];
    updatedAt: string;
}

export enum PlaceType {
    BAR = 'BAR',
    CLUB = 'CLUBS',
    CAFE = 'CAFE'
}


export const placeTypeLabels = [
  { label: 'Bar', value: PlaceType.BAR },
  { label: 'Club', value: PlaceType.CLUB },
  { label: 'Cafe', value: PlaceType.CAFE }
]

export const priceLevelLabels: Record<number, string> = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$'
};

export const dayLabels: string[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]
