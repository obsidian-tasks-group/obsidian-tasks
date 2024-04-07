import { Field } from './Field';

export abstract class BooleanPreprocessor extends Field {}

export type ParseResult = {
    simplifiedLine: string;
    filters: { [key: string]: string };
};
