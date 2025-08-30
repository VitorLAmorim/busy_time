import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Place } from '../models/place.model';
import {Filters} from '../components/filter-bar/filter-bar';
import { environment } from '../../environments/environment';

/**
 * Interface for searching places with params
 * @param page - Page number
 * @param limit - Number of items per page
 * @param filters - Filters for searching places
 * @param fields - Fields to be returned
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort order
 */
export interface GetPlacesParams {
  page?: number;
  limit?: number;
  filters?: Filters;
  queryFields?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}


export interface ValidateApiKeyReponse {
  active: boolean;
  api_key_private: string;
  api_key_public: string;
  credits_forecast: number;
  credits_query: number;
  status: string;
  valid: boolean
}

/**
 * Interface for paginated response
 * @param places - Array of places
 * @param pagination - Pagination object
 * @param pagination.page - Current page
 * @param pagination.limit - Number of items per page
 * @param pagination.total - Total number of items
 * @param pagination.pages - Total number of pages
 */
export interface PaginatedResponse<T> {
  places: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class PlaceService {
    private apiUrl = 'https://busy-time.onrender.com/places';

    constructor(private http: HttpClient) {
        console.log('Environment:', environment);
        console.log('API URL:', this.apiUrl);
    }

  getPlaces(params: GetPlacesParams = {}): Observable<PaginatedResponse<Place>> {
    const {
      page = 1,
      limit = 20,
      filters,
      queryFields = [],
      sortBy = 'name',
      sortOrder = 'asc'
    } = params;

    let httpParams = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (filters) {
      if (filters.name) httpParams = httpParams.set('name', filters.name);
      if (filters.address) httpParams = httpParams.set('address', filters.address);
      if (filters.minRating) httpParams = httpParams.set('minRating', filters.minRating.toString());
      if (filters.minReviews) httpParams = httpParams.set('minReviews', filters.minReviews.toString());
      if (filters.priceLevel) httpParams = httpParams.set('priceLevel', filters.priceLevel.toString());
      if (filters.type && filters.type.length > 0) {
        httpParams = httpParams.set('type', filters.type.join(','));
      }
    }

    if (queryFields && queryFields.length > 0) {
      httpParams = httpParams.set('queryFields', queryFields.join(','));
    }

    return this.http.get<PaginatedResponse<Place>>(this.apiUrl, { params: httpParams });
  }

    getPlace(id: string): Observable<Place> {
        return this.http.get<Place>(`${this.apiUrl}/${id}`);
    }

    getApiKeyInfo(): Observable<ValidateApiKeyReponse> {
      return this.http.get<ValidateApiKeyReponse>(`${this.apiUrl}/validateKey`);
    }

    updatePlacesFromApi(lat?: number, lng?: number, types?: string, limit?: number, mockData?: boolean) {
      let httpParams = new HttpParams()
          if(lat && lng) {
            httpParams = httpParams.set('lat', lat.toString());
            httpParams = httpParams.set('lng', lng.toString());
          }
          if(types) {
            httpParams = httpParams.set('types', types);
          }
          if(limit) {
            httpParams = httpParams.set('limit', limit.toString());
          }
          if(mockData) {
            httpParams = httpParams.set('mockData', mockData.toString());
          }
          return this.http.get<Place[]>(`${this.apiUrl}/updateData`, { params: httpParams });
    }
}
