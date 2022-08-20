/**
 * An interface for determining whether a string value matches a particular condition.
 *
 * This is used to hide away the details of various text searches, such as the
 * simple inclusion of a sub-string, or the more complex regular expression searches.
 */
export interface IStringMatcher {
    /**
     * Return whether the given string matches this condition.
     * @param stringToSearch
     */
    matches(stringToSearch: string): boolean;
}
