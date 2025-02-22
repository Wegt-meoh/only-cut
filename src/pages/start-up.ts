import { css, html, LitElement, PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";
import "../components/project-card.ts"
import "../components/title-bar.ts"
import "../components/create-project-card.ts"
import { listAllProjects } from "../utils/config-manager.ts";


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

    async firstUpdated(_changedProperties: PropertyValues) {
        const projectList = await listAllProjects();
        console.log(projectList);
    }

    render() {
        return html`
            <title-bar></title-bar>                           
            <div>
                <div class="project-container">
                    <create-project-card></create-project-card>                    
                </div>
            </div>
        `
    }
}


