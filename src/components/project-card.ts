import { invoke } from "@tauri-apps/api/core";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { MediaEditorProject } from "../types/project-config";
import { calculateFolderSize, formatTime, formatToReadableSize } from "../utils/common";
import { join } from "@tauri-apps/api/path";
import { projectConfigDir } from "../utils/path";
import "../components/seperation-line";

@customElement('project-card')
export class ProjectCard extends LitElement {
    static styles = css`            
        :host{
            display: grid;
            grid-template-rows: 100px 20px 14px;
            width: 100px;   
            overflow: hidden;                  
        }

        .cover{
            width: 100px;
            height: 100px;
            background: black;
            overflow: hidden;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .cover>img{
            height:100%;

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
        
        .desc{
            display: flex;
            flex-flow: center;
            gap: 3px;
            font-size: 14px;                        
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
            const projectFolderPath = await join(await projectConfigDir(), this.project.metadata.name);
            this.size = formatToReadableSize(await calculateFolderSize(projectFolderPath))
        }
    }

    render() {
        const firstTrack = this.project?.timeline.tracks[0];
        const totalTime = firstTrack ? firstTrack.clips.reduce((prev, curr) => prev + curr.end_time - curr.start_time, 0) : 0;
        const cover_path = this.project?.metadata.cover_path;

        return html`
            <div class="cover" @click="${this._openProject}">                
                ${cover_path ? html`<img src="${cover_path}"></img>` : html``}
            </div>
            <div class="name">${this.project?.metadata.name}</div>
            <div class="desc">
                ${this.size} <seperation-line></seperation-line> ${formatTime(totalTime)}
            </div>            
        `
    }
}