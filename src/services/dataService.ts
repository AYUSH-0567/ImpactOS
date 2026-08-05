import { IDataRepository } from './repository.interface';
import { MockRepository } from './mockRepository';
import { ApiRepository } from './apiRepository';

/**
 * Data Service Singleton Factory
 * Seamlessly toggles between MockRepository (development/synthetic)
 * and ApiRepository (production private PostgreSQL backend) based on VITE_USE_MOCK_DATA env flag.
 */

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const repository: IDataRepository = useMockData
  ? new MockRepository()
  : new ApiRepository();

export const dataService = repository;
