import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { appLocalDataDir } from "@tauri-apps/api/path";
import { readDir } from "@tauri-apps/plugin-fs";
import "../components/project-card.ts"
import "../components/title-bar.ts"
import "../components/create-project-card.ts"


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

    render() {
        // const existProjects = []
        // const appLocalDataDirPath = await appLocalDataDir()
        // const entryList = await readDir(appLocalDataDirPath)
        // entryList.filter(entry => entry.isDirectory).map(entry => {
        //     entry.name
        // })

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


