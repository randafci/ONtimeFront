import { HolidayTypeList } from './holiday-type.interface';

export interface Holiday {
  id: number;
  holidayTypeId: number;
  start: string;
  end: string;
  symbol: string;
  creationDate: string;
  modificationDate: string | null;
  modifiedBy: string;
  createdBy: string;
  isDeleted: boolean;
  holidayType?: HolidayTypeList | null;
  holidayTypeName?: string;
}

export interface CreateHoliday {
  holidayTypeId: number;
  start: string;
  end: string;
  symbol: string;
}

export interface EditHoliday {
  id: number;
  holidayTypeId: number;
  start: string;
  end: string;
  symbol: string;
}
