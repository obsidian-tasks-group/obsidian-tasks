import { printCombinations } from 'approvals/lib/Utilities/Printers';

export function runCombinations9<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
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
    ) => any,
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
    printCombinations(
        (p1, p2, p3, p4, p5, p6, p7, p8, p9) => {
            func(p1, p2, p3, p4, p5, p6, p7, p8, p9);
            return '';
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
}
