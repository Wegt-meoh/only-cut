import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { MediaEditorProject } from "../types/project-config";
import { calculateFolderSize, formatTime, formatToReadableSize, todo, ellipsisMiddleText } from "../utils/common";
import { join } from "@tauri-apps/api/path";
import "../components/seperation-line";
import "../components/global-mask";
import { appProjectConfigDirPath } from "../utils/path";

@customElement('project-card')
export class ProjectCard extends LitElement {
    static styles = css`            
        :host{
            display: grid;
            grid-template-rows: 100px 20px 14px;
            width: 100px;            
        }

        .cover{
            width: 100px;
            height: 100px;
            background: black;            
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;            
        }

        .cover>img{
            height:100%;

        }

        .cover:hover{
            cursor: pointer;
        }

        .cover:hover .menu{
            opacity: 1;
        }

        .menu{
            position: absolute;
            right: 6px;
            bottom: 4px;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: black;
            opacity: 0;
        }    

        .name{            
            color: var(--light-grey-color);                      
            white-space: nowrap;            
            font-size: 14px;
            line-height: 20px;  
            width:100px;       
        }   
        
        .desc{            
            display: flex;
            flex-flow: center;
            gap: 3px;
            font-size: 14px;                        
        }               
    `

    @property({ type: Object }) project?: MediaEditorProject;
    @state() size: string = "--KB";

    private _openProject() {
        if (this.project) {
            todo()
        }
    }

    private _showSubMenu(event: MouseEvent) {
        const menuElement = this.shadowRoot?.querySelector(".menu");
        const nameElement = this.shadowRoot?.querySelector(".name");
        if (!menuElement) {
            throw new Error('can not find menu in project card')
        }

        if (!nameElement) {
            throw new Error('can not find name in project card')
        }

        if (!this.project) {
            throw new Error("project is undefined")
        }

        this.dispatchEvent(new CustomEvent("show-submenu", {
            detail: {
                nameElement,
                menuElement,
                project: this.project
            },
            bubbles: false,
            composed: false
        }));

        event.stopPropagation()
    }

    protected async firstUpdated() {
        if (this.project) {
            const projectFolderPath = await join(appProjectConfigDirPath, this.project.name);
            this.size = formatToReadableSize(await calculateFolderSize(projectFolderPath));
        }
    }

    render() {
        const firstTrack = this.project?.config.timeline.tracks[0];
        const totalTime = firstTrack ? firstTrack.clips.reduce((prev, curr) => prev + curr.end_time - curr.start_time, 0) : 0;
        const cover_path = this.project?.config.metadata.cover_path;
        const truncatedName = ellipsisMiddleText(this.project?.name ?? "", "14px", 100);
        const nameSpan = truncatedName === this.project?.name ? html`<span class="name">${truncatedName}</span>` : html`<span class="name" title=${this.project?.name ?? ""}>${truncatedName}</span>`

        return html`
            <div class="cover" @click=${this._openProject}>
                ${cover_path ? html`<img src="${cover_path}"></img>` : html``}
                <div class="menu" @click=${this._showSubMenu}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracurrentColorerCarrier" stroke-linecurrentcap="round" stroke-linejoin="round"></g><g id="SVGRepo_icurrentColoronCarrier"> <path d="M7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12Z" fill="currentColor"></path> <path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" fill="currentColor"></path> <path d="M21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12Z" fill="currentColor"></path> </g></svg>                    
                </div>
            </div>
            ${nameSpan}            
            <div class="desc">
                ${this.size} <seperation-line></seperation-line> ${formatTime(totalTime)}
            </div>                      
        `
    }
}