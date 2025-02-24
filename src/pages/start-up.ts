import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "../components/project-card.ts"
import "../components/title-bar.ts"
import "../components/create-project-card.ts"
import { listAllProjects } from "../utils/config-manager.ts";
import * as z from "../utils/z";
import { MediaEditorSchema } from "../schemas/project-config.ts";


@customElement('start-up')
export class StartUp extends LitElement {
    static styles = css`
        :host{
            display: grid;
            grid-template-rows: 30px  1fr;
            height: 100%;            
        }          
        
        .project-container{
            padding: 1rem;
            display: flex;
            flex-flow: row wrap;
            gap: 14px;
            justify-content: start;
            align-items: flex-start;      
        }
    `

    @state() private projectList: z.infer<typeof MediaEditorSchema>[] = [];

    async firstUpdated() {
        const projectList = await listAllProjects();
        this.projectList = projectList;
    }

    render() {
        return html`
            <title-bar></title-bar>                                          
            <div class="project-container">
                <create-project-card></create-project-card>
                ${this.projectList.map(project => html`<project-card .project=${project}></project-card>`)}
            </div>            
        `
    }
}


