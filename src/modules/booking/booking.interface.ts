import { BookingStatus } from '../../generated/prisma';

export interface ICreateBooking {
  serviceId: string;
  scheduledDate: string;
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

export interface IBookingResponse {
  id: string;
  bookingNumber: string;
  customerId: string;
  technicianId: string;
  serviceId: string;
  scheduledDate: Date;
  scheduledTime: string;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}