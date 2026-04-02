import * as chrono from 'chrono-node';
import type { Moment } from 'moment';
import { DateRange } from './DateRange';

export class DateParser {
    private static readonly isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    private static readonly weekPattern = /^(last|this|next) week$/i;
    private static readonly modifiedWeekdayPattern =
        /^(last|this|next) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i;

    public static parseDate(
        input: string,
        forwardDate: boolean = false,
        referenceDate: Date | undefined = undefined,
    ): Moment {
        // Using start of day to correctly match on comparison with other dates (like equality).
        return DateParser.parseDateTime(input, forwardDate, referenceDate).startOf('day');
    }

    public static parseDateTime(
        input: string,
        forwardDate: boolean = false,
        referenceDate: Date | undefined = undefined,
    ): Moment {
        const parsedDate = DateParser.parseSingleDate(input, referenceDate, forwardDate);
        return parsedDate ? window.moment(parsedDate) : window.moment.invalid();
    }

    /**
     * Parse a line and extract a pair of dates, returned in a tuple, sorted by date.
     * @param input - any pair of dates, separate by one or more spaces '17 August 2013 19 August 2013',
     *                or a single date.
     * @param forwardDate - if true, and date is ambiguous, chrono will return dates in the future
     * @return - A Tuple of dates. If both input dates are invalid, then both output dates will be invalid.
     */
    public static parseDateRange(input: string, forwardDate: boolean = false): DateRange {
        const dateRangeParsers = [
            // Try parsing a relative date range like 'current month'
            DateParser.parseRelativeDateRange,
            // Try '2022-W10' otherwise
            DateParser.parseNumberedDateRange,
            // If previous failed, fallback on absolute date range with chrono
            DateParser.parseAbsoluteDateRange,
        ];

        for (const parser of dateRangeParsers) {
            const parsedDateRange = parser(input, forwardDate);
            if (parsedDateRange.isValid()) {
                return parsedDateRange;
            }
        }

        // If nothing worked return and invalid date range
        return DateRange.buildInvalid();
    }

    private static parseAbsoluteDateRange(input: string, forwardDate: boolean): DateRange {
        const normalizedInput = DateParser.normalizeInput(input);

        const legacySingleDate = DateParser.parseLegacyRelativeDate(normalizedInput, undefined, forwardDate);
        if (legacySingleDate !== undefined) {
            return new DateRange(window.moment(legacySingleDate), window.moment(legacySingleDate));
        }

        const strictIsoRange = DateParser.parseStrictIsoDateRange(normalizedInput);
        if (strictIsoRange !== undefined) {
            return strictIsoRange;
        }

        const result = chrono.parse(normalizedInput, undefined, {
            forwardDate: forwardDate,
        });

        // Check chrono parsing
        if (result.length === 0) {
            return DateRange.buildInvalid();
        }

        const startDate = result[0].start;
        const endDate = result[1] && result[1].start ? result[1].start : startDate;
        const start = window.moment(startDate.date());
        const end = window.moment(endDate.date());

        return new DateRange(start, end);
    }

    private static parseSingleDate(input: string, referenceDate: Date | undefined, forwardDate: boolean): Date | null {
        const trimmedInput = DateParser.normalizeInput(input);

        const legacySingleDate = DateParser.parseLegacyRelativeDate(trimmedInput, referenceDate, forwardDate);
        if (legacySingleDate !== undefined) {
            return legacySingleDate;
        }

        const strictIsoDate = DateParser.parseStrictIsoDate(trimmedInput, referenceDate, forwardDate);
        if (strictIsoDate !== undefined) {
            return strictIsoDate;
        }

        const isoDateTokens = trimmedInput.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? [];
        if (
            isoDateTokens.length > 0 &&
            isoDateTokens.every((token) => DateParser.parseStrictIsoDate(token, referenceDate, forwardDate) === null)
        ) {
            return null;
        }

        return chrono.parseDate(trimmedInput, referenceDate, {
            forwardDate: forwardDate,
        });
    }

    private static parseStrictIsoDate(
        input: string,
        referenceDate: Date | undefined,
        forwardDate: boolean,
    ): Date | null | undefined {
        if (!DateParser.isoDatePattern.test(input)) {
            return undefined;
        }

        const strictDate = window.moment(input, 'YYYY-MM-DD', true);
        return strictDate.isValid()
            ? chrono.parseDate(input, referenceDate, {
                  forwardDate: forwardDate,
              })
            : null;
    }

    private static parseStrictIsoDateRange(input: string): DateRange | undefined {
        const tokens = input
            .trim()
            .split(/\s+/)
            .filter((token) => token.length > 0);
        if (tokens.length === 0 || !tokens.every((token) => DateParser.isoDatePattern.test(token))) {
            return undefined;
        }

        const validDates = tokens
            .map((token) => window.moment(token, 'YYYY-MM-DD', true))
            .filter((date) => date.isValid());

        if (validDates.length === 0) {
            return DateRange.buildInvalid();
        }

        const start = validDates[0].clone();
        const end = (validDates[1] ?? validDates[0]).clone();
        return new DateRange(start, end);
    }

    private static parseLegacyRelativeDate(
        input: string,
        referenceDate: Date | undefined = undefined,
        forwardDate: boolean = false,
    ): Date | undefined {
        const normalizedInput = input.trim().toLowerCase();
        const effectiveReferenceDate =
            referenceDate ?? chrono.parseDate('today', undefined, { forwardDate: false }) ?? new Date();
        const weekStart = window.moment(effectiveReferenceDate).startOf('week');

        const modifiedWeekdayMatch = normalizedInput.match(DateParser.modifiedWeekdayPattern);
        if (modifiedWeekdayMatch) {
            const targetWeek = DateParser.adjustWeek(weekStart, modifiedWeekdayMatch[1]);
            const weekdayIndex = DateParser.weekdayIndex(modifiedWeekdayMatch[2]);
            return targetWeek.add(weekdayIndex, 'day').toDate();
        }

        const weekMatch = normalizedInput.match(DateParser.weekPattern);
        if (weekMatch && weekMatch[1].toLowerCase() === 'this' && forwardDate) {
            return weekStart.toDate();
        }

        return undefined;
    }

    private static adjustWeek(weekStart: Moment, modifier: string): Moment {
        switch (modifier.toLowerCase()) {
            case 'last':
                return weekStart.subtract(1, 'week');
            case 'next':
                return weekStart.add(1, 'week');
            default:
                return weekStart;
        }
    }

    private static weekdayIndex(dayName: string): number {
        const weekdayMap: Record<string, number> = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        };

        return weekdayMap[dayName.toLowerCase()];
    }

    private static normalizeInput(input: string): string {
        return input.trim().replace(/^date\s+/i, '');
    }

    private static parseRelativeDateRange(input: string, _forwardDate: boolean): DateRange {
        const relativeDateRangeRegexp = /(last|this|next) (week|month|quarter|year)/;
        const relativeDateRangeMatch = input.match(relativeDateRangeRegexp);
        if (relativeDateRangeMatch && relativeDateRangeMatch.length === 3) {
            const lastThisNext = relativeDateRangeMatch[1];
            const range = relativeDateRangeMatch[2];

            const dateRange = DateRange.buildRelative(range as moment.unitOfTime.StartOf);

            switch (lastThisNext) {
                case 'last':
                    dateRange.moveToPrevious(range as moment.unitOfTime.DurationConstructor);
                    break;
                case 'next':
                    dateRange.moveToNext(range as moment.unitOfTime.DurationConstructor);
                    break;
            }

            return dateRange;
        }

        return DateRange.buildInvalid();
    }

    private static parseNumberedDateRange(input: string, _forwardDate: boolean): DateRange {
        const parsingVectors: [RegExp, string, moment.unitOfTime.StartOf][] = [
            [/^\s*[0-9]{4}\s*$/, 'YYYY', 'year'],
            [/^\s*[0-9]{4}-Q[1-4]\s*$/, 'YYYY-Q', 'quarter'],
            [/^\s*[0-9]{4}-[0-9]{2}\s*$/, 'YYYY-MM', 'month'],
            [/^\s*[0-9]{4}-W[0-9]{2}\s*$/, 'YYYY-WW', 'isoWeek'],
        ];

        for (const [regexp, dateFormat, range] of parsingVectors) {
            const matched = input.match(regexp);
            if (matched) {
                // RegExps allow spaces (\s*), remove them before calling window.moment()
                const date = matched[0].trim();
                return new DateRange(
                    window.moment(date, dateFormat).startOf(range),
                    window.moment(date, dateFormat).endOf(range),
                );
            }
        }

        return DateRange.buildInvalid();
    }
}
