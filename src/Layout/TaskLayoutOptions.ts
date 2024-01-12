import { type TaskLayoutComponent, defaultLayout } from '../TaskLayout';

export class TaskLayoutOptions2 {
    private visible: { [component: string]: boolean } = {};
    private tagsVisible: boolean = true;

    constructor() {
        defaultLayout.forEach((component) => {
            this.visible[component] = true;
        });
    }

    public isShown(component: TaskLayoutComponent) {
        return this.visible[component];
    }

    public areTagsShown() {
        return this.tagsVisible;
    }

    public hide(component: TaskLayoutComponent) {
        this.visible[component] = false;
    }

    public setVisibility(component: TaskLayoutComponent, visible: boolean) {
        this.visible[component] = visible;
    }

    public setTagsVisibility(visibility: boolean) {
        this.tagsVisible = visibility;
    }

    public get shownComponents() {
        return defaultLayout.filter((component) => {
            return this.visible[component];
        });
    }

    public get hiddenComponents() {
        return defaultLayout.filter((component) => {
            return !this.visible[component];
        });
    }

    /**
     * These represent the existing task options, so some components (description & block link for now) are not
     * here because there are no layout options to remove them.
     */
    public get toggleableComponents() {
        return defaultLayout.filter((component) => {
            // Description and blockLink are always shown
            return component !== 'description' && component !== 'blockLink';
        });
    }

    public toggleVisibilityExceptDescriptionAndBlockLink() {
        this.toggleableComponents.forEach((component) => {
            this.visible[component] = !this.visible[component];
        });

        this.setTagsVisibility(!this.areTagsShown());
    }
}