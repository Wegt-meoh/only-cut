import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { MediaEditorProject } from "../../types/project-config";
import { loadProjectConfig } from "../../utils/config-manager";
import "./components/file-explorer";
import "./components/clips-track";
import "./components/control-board";
import "./components/media-player";

@customElement("main-work")
export class MainWork extends LitElement {
    private href = window.location.href;
    private projectName = this.href.slice(this.href.indexOf("name=") + 5);
    private projectConfig?: MediaEditorProject;

    async firstUpdated() {
        const loadedConfig = await loadProjectConfig(this.projectName);
        if (!loadedConfig) {
            console.error(`Can not load the project named "${this, this.projectName}"`);
            return;
        }

        this.projectConfig = {
            name: this.projectName,
            config: loadedConfig,
        };
        console.log(this.projectConfig);
    }

    render() {
        return html`      
        <file-explorer></file-explorer>
        <media-player></media-player>
        <control-board></control-board>
        <clips-track></clips-track>
        `;
    }
}
