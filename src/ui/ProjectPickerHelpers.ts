import { type FuzzyMatch, prepareSimpleSearch } from 'obsidian';
import type { TickTickProject } from '../Config/Settings';

export function searchProject(query: string, allProjects: TickTickProject[]): TickTickProject[] {
    if (query === '') {
        return allProjects;
    }

    const preparedSearch = prepareSimpleSearch(query);

    // The cutoff was chosen empirically, to filter out very poor matches:
    const minimumScoreCutoff = -4.0;

    const matches: FuzzyMatch<TickTickProject>[] = allProjects
        .map((project) => {
            const result = preparedSearch(project.name);
            if (result && result.score > minimumScoreCutoff) {
                return {
                    item: project,
                    match: result,
                };
            }
            return null;
        })
        .filter(Boolean) as FuzzyMatch<TickTickProject>[];

    // All scores are negative. Closer to zero is better.
    const sortedMatches = matches.sort((a, b) => b.match.score - a.match.score);

    // Retain commented-out logging until confident in the minimumScoreCutoff value.
    // console.log('>>>>>>>>>> start of matches');
    // sortedMatches.forEach((match) => {
    //     console.log(`${JSON.stringify(match.match)}: ${descriptionAdjustedForDependencySearch(match.item)}`);
    // });
    // console.log('<<<<<<<<<< end of matches');

    return sortedMatches.map((item) => item.item);
}
