// Hosted database round trips and row-lock waits can exceed Prisma's 5s default.
// Keep writes atomic, with a bounded deadline rather than retrying partial work.
export const appraisalTransactionOptions = { maxWait: 10_000, timeout: 30_000 };
