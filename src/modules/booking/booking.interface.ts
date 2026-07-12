import { BookingStatus } from '../../generated/prisma';

export interface ICreateBooking {
  serviceId: string;
  scheduledDate: Date;
  scheduledTime: string;
  durationMinutes?: number;
  notes?: string;
}

export interface IUpdateBooking {
  status?: BookingStatus;
  notes?: string;
  cancellationReason?: string;
}

export interface IBookingFilter {
  status?: BookingStatus;
  customerId?: string;
  technicianId?: string;
  serviceId?: string;
  scheduledDate?: Date;
  startDate?: Date;
  endDate?: Date;
}