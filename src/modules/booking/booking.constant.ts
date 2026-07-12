export const bookingStatus = {
  REQUESTED: 'REQUESTED',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  PAID: 'PAID',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const bookingStatusTransitions: Record<string, string[]> = {
  REQUESTED: ['ACCEPTED', 'DECLINED', 'CANCELLED'],
  ACCEPTED: ['PAID', 'CANCELLED'],
  PAID: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  DECLINED: [],
  CANCELLED: [],
};

export const bookingFilterableFields = [
  'status',
  'customerId',
  'technicianId',
  'serviceId',
  'scheduledDate',
];

export const bookingSearchableFields = [
  'bookingNumber',
  'customer.name',
  'technician.user.name',
  'service.title',
];
