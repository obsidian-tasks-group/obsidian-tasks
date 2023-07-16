import type { Explanation } from '../Explain/Explanation';

/**
 * An interface for determining whether a string value matches a particular condition.
 *
 * This is used to hide away the details of various text searches, such as the
 * simple inclusion of a sub-string, or the more complex regular expression searches.
 */
export abstract class IStringMatcher {
    /**
     * Return whether the given string matches this condition.
     * @param stringToSearch
     */
    public abstract matches(stringToSearch: string): boolean;

    /**
     * Return whether any of the given strings matches this condition.
     * @param stringsToSearch
     */
    public matchesAnyOf(stringsToSearch: string[]) {
        return stringsToSearch.some((s) => this.matches(s));
    }

    /**
     * Return an {@link Explanation} object, with any extra detail
     * about the behaviour of this matcher.
     *
     * If there is no extra detail, just pass {@link instruction} in to
     * the {@link Explanation} constructor.
     */
    public abstract explanation(instruction: string): Explanation;
}
