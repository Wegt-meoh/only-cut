import { invoke } from "@tauri-apps/api/core";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { MediaEditorProject } from "../types/project-config";
import { calculateFolderSize, formatToReadableSize } from "../utils/common";
import { join } from "@tauri-apps/api/path";
import { projectConfigDir } from "../utils/path";

@customElement('project-card')
export class ProjectCard extends LitElement {
    static styles = css`            
        :host{
            display: grid;
            grid-template-rows: 100px 40px;                       
            width: 100px;   
            overflow: hidden;         
        }

        .cover{
            width: 100px;
            height: 100px;
            background: black;
            border-radius: 12px;
        }

        .cover:hover{
            cursor: pointer;
        }

        .name{            
            color: var(--light-grey-color);
            margin: 2px 0 2px 0;            
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;                        
        }                   

        .desc svg{
            width: 11px;
            height: 11px;
        }        
    `

    @property({ type: Object }) project: MediaEditorProject | undefined;
    @state() size: string = "--KB";

    private _openProject() {
        if (this.project) {
            invoke("open_project", { projectName: this.project.metadata.name })
        }
    }

    protected async firstUpdated() {
        if (this.project) {
            this.size = formatToReadableSize(await calculateFolderSize(await join(await projectConfigDir(), this.project.metadata.name)))
        }
    }

    render() {
        return html`
            <div class="cover" @click="${this._openProject}"></div>
            <div>
                <div class="name">${this.project?.metadata.name}</div>
                <div class="desc">                    
                    <span>
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracurrentColorerCarrier" stroke-linecurrentcap="round" stroke-linejoin="round"></g><g id="SVGRepo_icurrentColoronCarrier"> <path fill="none" stroke="currentColor" stroke-width="2" d="M2,5.07692308 C2,5.07692308 3.66666667,2 12,2 C20.3333333,2 22,5.07692308 22,5.07692308 L22,18.9230769 C22,18.9230769 20.3333333,22 12,22 C3.66666667,22 2,18.9230769 2,18.9230769 L2,5.07692308 Z M2,13 C2,13 5.33333333,16 12,16 C18.6666667,16 22,13 22,13 M2,7 C2,7 5.33333333,10 12,10 C18.6666667,10 22,7 22,7"></path> </g></svg>
                        ${this.size}
                    </span>
                    <span>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracurrentColorerCarrier" stroke-linecurrentcap="round" stroke-linejoin="round"></g><g id="SVGRepo_icurrentColoronCarrier"> <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecurrentcap="round" stroke-linejoin="round"></path> <path d="M12 6V12" stroke="currentColor" stroke-width="1.5" stroke-linecurrentcap="round" stroke-linejoin="round"></path> <path d="M16.24 16.24L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecurrentcap="round" stroke-linejoin="round"></path> </g></svg>
                        ${this.project?.metadata.last_modified}
                    </span> 
                </div>                   
            </div>
        `
    }
}