import { it } from '@jest/globals';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';
import { EMPTY } from 'approvals/lib/Utilities/Printers';
import { formatToRepresentType } from '../Scripting/ScriptingTestHelpers';
import { runCombinations9 } from './RunCombinations';

/**
 * Add quotes around any string values.
 *
 * If the code in this file is ever published up-stream to Approvals.NodeJS, we can always copy
 * formatToRepresentType() over too.
 * @param x
 */
export function fmt(x: any): string {
    return formatToRepresentType(x);
}

export function verifyAllCombinations2Async<T1, T2>(
    name: string,
    title: string,
    func: <T1, T2>(t1: T1, t2: T2) => Promise<any>,
    params1: T1[],
    params2: T2[],
) {
    let output = title + '\n';
    runCombinations9(
        (t1, t2, _t3, _t4, _t5, _t6, _t7, _t8, _t9) => {
            it(`${name} ${fmt(t1)} ${fmt(t2)}`, async () => {
                output += (await func(t1, t2)) + '\n';
            });
        },
        params1,
        params2,
        EMPTY,
        EMPTY,
        EMPTY,
        EMPTY,
        EMPTY,
        EMPTY,
        EMPTY,
    );

    it(name, () => {
        verify(output);
    });
}

export function verifyAllCombinations3Async<T1, T2, T3>(
    name: string,
    title: string,
    func: <T1, T2, T3>(t1: T1, t2: T2, t3: T3) => Promise<any>,
    params1: T1[],
    params2: T2[],
    params3: T3[],
) {
    let output = title + '\n';
    runCombinations9(
        (t1, t2, t3, _t4, _t5, _t6, _t7, _t8, _t9) => {
            it(`${name} ${fmt(t1)} ${fmt(t2)} ${fmt(t3)}`, async () => {
                output += (await func(t1, t2, t3)) + '\n';
            });
        },
        params1,
        params2,
        params3,
        EMPTY,
        EMPTY,
        EMPTY,
        EMPTY,
        EMPTY,
        EMPTY,
    );

    it(name, () => {
        verify(output);
    });
}

export function verifyAllCombinations4Async<T1, T2, T3, T4>(
    name: string,
    title: string,
    func: <T1, T2, T3, T4>(t1: T1, t2: T2, t3: T3, t4: T4) => Promise<any>,
    params1: T1[],
    params2: T2[],
    params3: T3[],
    params4: T4[],
) {
    let output = title + '\n';
    runCombinations9(
        (t1, t2, t3, t4, _t5, _t6, _t7, _t8, _t9) => {
            it(`${name} ${fmt(t1)} ${fmt(t2)} ${fmt(t3)} ${fmt(t4)}`, async () => {
                output += (await func(t1, t2, t3, t4)) + '\n';
            });
        },
        params1,
        params2,
        params3,
        params4,
        EMPTY,
        EMPTY,
        EMPTY,
        EMPTY,
        EMPTY,
    );

    it(name, () => {
        verify(output);
    });
}

export function verifyAllCombinations5Async<T1, T2, T3, T4, T5>(
    name: string,
    title: string,
    func: <T1, T2, T3, T4, T5>(t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => Promise<any>,
    params1: T1[],
    params2: T2[],
    params3: T3[],
    params4: T4[],
    params5: T5[],
) {
    let output = title + '\n';
    runCombinations9(
        (t1, t2, t3, t4, t5, _t6, _t7, _t8, _t9) => {
            it(`${name} ${fmt(t1)} ${fmt(t2)} ${fmt(t3)} ${fmt(t4)} ${fmt(t5)}`, async () => {
                output += (await func(t1, t2, t3, t4, t5)) + '\n';
            });
        },
        params1,
        params2,
        params3,
        params4,
        params5,
        EMPTY,
        EMPTY,
        EMPTY,
        EMPTY,
    );

    it(name, () => {
        verify(output);
    });
}

export function verifyAllCombinations6Async<T1, T2, T3, T4, T5, T6>(
    name: string,
    title: string,
    func: <T1, T2, T3, T4, T5, T6>(t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6) => Promise<any>,
    params1: T1[],
    params2: T2[],
    params3: T3[],
    params4: T4[],
    params5: T5[],
    params6: T6[],
) {
    let output = title + '\n';
    runCombinations9(
        (t1, t2, t3, t4, t5, t6, _t7, _t8, _t9) => {
            it(`${name} ${fmt(t1)} ${fmt(t2)} ${fmt(t3)} ${fmt(t4)} ${fmt(t5)} ${fmt(t6)}`, async () => {
                output += (await func(t1, t2, t3, t4, t5, t6)) + '\n';
            });
        },
        params1,
        params2,
        params3,
        params4,
        params5,
        params6,
        EMPTY,
        EMPTY,
        EMPTY,
    );

    it(name, () => {
        verify(output);
    });
}

export function verifyAllCombinations7Async<T1, T2, T3, T4, T5, T6, T7>(
    name: string,
    title: string,
    func: <T1, T2, T3, T4, T5, T6, T7>(t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, t7: T7) => Promise<any>,
    params1: T1[],
    params2: T2[],
    params3: T3[],
    params4: T4[],
    params5: T5[],
    params6: T6[],
    params7: T7[],
) {
    let output = title + '\n';
    runCombinations9(
        (t1, t2, t3, t4, t5, t6, t7, _t8, _t9) => {
            it(`${name} ${fmt(t1)} ${fmt(t2)} ${fmt(t3)} ${fmt(t4)} ${fmt(t5)} ${fmt(t6)} ${fmt(t7)}`, async () => {
                output += (await func(t1, t2, t3, t4, t5, t6, t7)) + '\n';
            });
        },
        params1,
        params2,
        params3,
        params4,
        params5,
        params6,
        params7,
        EMPTY,
        EMPTY,
    );

    it(name, () => {
        verify(output);
    });
}

export function verifyAllCombinations8Async<T1, T2, T3, T4, T5, T6, T7, T8>(
    name: string,
    title: string,
    func: <T1, T2, T3, T4, T5, T6, T7, T8>(
        t1: T1,
        t2: T2,
        t3: T3,
        t4: T4,
        t5: T5,
        t6: T6,
        t7: T7,
        t8: T8,
    ) => Promise<any>,
    params1: T1[],
    params2: T2[],
    params3: T3[],
    params4: T4[],
    params5: T5[],
    params6: T6[],
    params7: T7[],
    params8: T8[],
) {
    let output = title + '\n';
    runCombinations9(
        (t1, t2, t3, t4, t5, t6, t7, t8, _t9) => {
            it(`${name} ${fmt(t1)} ${fmt(t2)} ${fmt(t3)} ${fmt(t4)} ${fmt(t5)} ${fmt(t6)} ${fmt(t7)} ${fmt(
                t8,
            )}`, async () => {
                output += (await func(t1, t2, t3, t4, t5, t6, t7, t8)) + '\n';
            });
        },
        params1,
        params2,
        params3,
        params4,
        params5,
        params6,
        params7,
        params8,
        EMPTY,
    );

    it(name, () => {
        verify(output);
    });
}

export function verifyAllCombinations9Async<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    name: string,
    title: string,
    func: <T1, T2, T3, T4, T5, T6, T7, T8, T9>(
        t1: T1,
        t2: T2,
        t3: T3,
        t4: T4,
        t5: T5,
        t6: T6,
        t7: T7,
        t8: T8,
        t9: T9,
    ) => Promise<any>,
    params1: T1[],
    params2: T2[],
    params3: T3[],
    params4: T4[],
    params5: T5[],
    params6: T6[],
    params7: T7[],
    params8: T8[],
    params9: T9[],
) {
    let output = title + '\n';
    runCombinations9(
        (t1, t2, t3, t4, t5, t6, t7, t8, t9) => {
            it(`${name} ${fmt(t1)} ${fmt(t2)} ${fmt(t3)} ${fmt(t4)} ${fmt(t5)} ${fmt(t6)} ${fmt(t7)} ${fmt(t8)} ${fmt(
                t9,
            )}`, async () => {
                output += (await func(t1, t2, t3, t4, t5, t6, t7, t8, t9)) + '\n';
            });
        },
        params1,
        params2,
        params3,
        params4,
        params5,
        params6,
        params7,
        params8,
        params9,
    );

    it(name, () => {
        verify(output);
    });
}
