module.exports = async () => {
    process.env.TZ = 'UTC';

    /*
     * Note: Currently many tests fail if the global timezone is changed, due to
     *       the use of `moment.toISOString()` in the `toEqualMoment()`
     *       custom matcher in our tests.
     *       Tests that need a different time zone should set it explicitly,
     *       using `withTimezone()` (because vitest.config.ts uses `pool: 'vmForks'`).
     */
};
