module.exports = async () => {
    process.env.TZ = 'UTC';

    /*
     * Below is an example alternative time zone, for experimentation.
     * See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
     * Note: Currently many tests fail if the timezone is changed, due to
     *       the use of `moment.toISOString()` in the `toEqualMoment()`
     *       custom matcher in our tests.
     */
    // process.env.TZ = 'Pacific/Auckland';
};
