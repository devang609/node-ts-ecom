export const roles = ['BUYER', 'SELLER', 'ADMIN'] as const;

export type Role = (typeof roles)[number];

