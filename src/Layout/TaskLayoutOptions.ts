import { type TaskLayoutComponent, defaultLayout } from '../TaskLayout';

export class TaskLayoutOptions2 {
    private visible: { [component: string]: boolean } = {};

    constructor() {
        defaultLayout.forEach((component) => {
            this.visible[component] = true;
        });
    }

    public isShown(component: TaskLayoutComponent) {
        return this.visible[component];
    }

    public hide(component: TaskLayoutComponent) {
        this.visible[component] = false;
    }

    public setVisibility(component: TaskLayoutComponent, visible: boolean) {
        this.visible[component] = visible;
    }

    public get visibleComponents() {
        return defaultLayout.filter((component) => {
            return this.visible[component];
        });
    }
}
