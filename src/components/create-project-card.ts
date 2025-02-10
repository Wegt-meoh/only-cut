import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { getCurrentDate } from "../utils/time";
import { getUniquePath, projectConfigDir } from "../utils/path";
import { mkdir } from "@tauri-apps/plugin-fs";
import { todo } from "../utils/helper";

@customElement('create-project-card')
export class createProjectCard extends LitElement {
    static styles = css`
        div{
            width: 100px;
            height: 100px;
            border: dashed 4px var(--grey-color);
            border-radius: 12px;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;            
        }

        svg{
            width: 48px;
            height: 48px;            
        }

        div:hover{
            cursor: pointer;
            border-color: var(--light-grey-color);
        }
        
        div:hover>svg{
            color: var(--light-grey-color);
        }        
    `

    private async _createNewProject() {
        const currentDate = getCurrentDate();
        const uniquePath = await getUniquePath(await projectConfigDir(), currentDate);
        await mkdir(uniquePath);
        todo();
    }

    private async _handleClick() {
        console.log(navigator.language)
        // await this._createProject();
        todo();
    }

    render() {
        return html`
            <div @click="${this._handleClick}">
                <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracurrentColorerCarrier" stroke-linecurrentcurrentcurrentcap="round" stroke-linejoin="round"></g><g id="SVGRepo_icurrentColoronCarrier"> <path fill="currentColor" d="M15 9a1 1 0 0 1-1 1h-4v4a1 1 0 0 1-2 0v-4H4a1 1 0 0 1 0-2h4V4a1 1 0 0 1 2 0v4h4a1 1 0 0 1 1 1z"></path> </g></svg>
            </div>
        `
    }
}