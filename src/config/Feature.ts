import featuresJson from './featureConfiguration.json';

export type FeatureFlag = {
    [internalName: string]: boolean;
};

/**
 * The Feature class tracks all the possible features that users can enabled that are in development. This allows
 * new features to be added to the platform but not enabled by default. This reduces the complications when it
 * comes to adding new features and a large cascade of dependent branches.
 *
 * When you add a new feature you need to add it to the featureConfiguration.json file. It then needs to be added to
 * settings so a user can enable it. If you want it hidden you will need to manually update the data.json file. In the
 * plugin folder.
 *
 * @since 2022-05-29
 */
export class Feature {
    private constructor(
        public readonly internalName: string,
        public readonly index: number,
        public readonly description: string,
        public readonly displayName: string,
        public readonly enabledByDefault: boolean,
        public readonly stable: boolean,
    ) {}

    /**
     * Returns the list of all available features.
     *
     * @readonly
     * @static
     * @type {Feature[]}
     * @memberof Feature
     */
    static get values(): Feature[] {
        let availableFeatures: Feature[] = [];

        featuresJson.forEach((feature) => {
            availableFeatures = [
                ...availableFeatures,
                new Feature(
                    feature.internalName,
                    feature.index,
                    feature.description,
                    feature.displayName,
                    feature.enabledByDefault,
                    feature.stable,
                ),
            ];
        });
        return availableFeatures;
    }

    /**
     * Returns the enabled state of the feature.
     *
     * @readonly
     * @static
     * @type {FeatureFlag}
     * @memberof Feature
     */
    static get settingsFlags(): FeatureFlag {
        const featureFlags: { [internalName: string]: boolean } = {};

        Feature.values.forEach((feature) => {
            featureFlags[feature.internalName] = feature.enabledByDefault;
        });
        return featureFlags;
    }

    /**
     * Converts a name to its corresponding default Feature instance.
     *
     * @param name the name to convert to Feature
     * @throws RangeError, if a string that has no corresponding Feature value was passed.
     * @returns the matching Feature
     */
    static fromString(name: string): Feature {
        for (const feature of Feature.values) {
            if (name === feature.internalName) {
                return feature;
            }
        }

        throw new RangeError(
            `Illegal argument passed to fromString(): ${name} does not correspond to any available Feature ${
                (this as any).prototype.constructor.name
            }`,
        );
    }
}
