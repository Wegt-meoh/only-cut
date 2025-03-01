import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "../components/project-card.ts"
import "../components/title-bar.ts"
import "../components/create-project-card.ts"
import { copyProject, deleteProject, listAllProjects } from "../utils/config-manager.ts";
import * as z from "../utils/z";
import { MediaEditorSchema } from "../schemas/project-config.ts";
import { MediaEditorProject } from "../types/project-config.ts";


@customElement('start-up')
export class StartUp extends LitElement {
    static styles = css`
        :host{
            display: grid;
            grid-template-rows: 30px  1fr;
            height: 100%;
            overflow: hidden;
        }

        main{
            overflow-x: hidden;
            overflow-y: scroll;
            scrollbar-width: thin;
            scrollbar-color: transparent transparent;   
            transition: scrollbar-color 0.3s;
        }
        
        .project-container{
            height: fit-content;
            padding: 1rem;
            display: flex;
            flex-wrap: wrap;
            gap: 14px;
            justify-content: start;
            align-items: normal;            
        }       
        
        main::-webkit-scrollbar{
            width: 8px;            
        }

        main::-webkit-scrollbar-thumb {
            background-color: #888;
            border-radius: 4px;
            transition: backgournd-color 0.3s;
        }

        main::-webkit-scrollbar-track {
            background-color: transparent;
        }        

        .sub-menu{
            padding: 8px;
            cursor: pointer;
            user-select: none;
            position: fixed;                 
            z-index: 1001;     
            border-radius: 6px;
            overflow: hidden;
            width: fit-content;
            height: fit-content;
            background-color: var(--dark-bg-color);
            opacity: 0;
            top: 10000px;
            left: 10000px;
        }        

        .sub-menu.visible{            
            opacity: 1;
        }

        .sub-menu>*{
            border-radius: 3px;
            color: var(--light-grey-color);
            width: 100px;
            padding-top: 0.4rem;
            padding-bottom: 0.4rem;
            padding-left: 6px;
        }

        .sub-menu>*:hover{
            background-color: var(--grey-color)
        }
    `

    @state() private projectList: z.infer<typeof MediaEditorSchema>[] = [];
    @state() private scrollbarStyle = "";// used for scrollbar style
    @state() private isSubMenuVisible: boolean = false;
    @state() private subMenuStyle = "";
    private scrollTimer: number | null = null;
    private menuElement: HTMLDivElement | null = null;
    private subMenuElement: HTMLDivElement | null = null;
    private menuProjectConfig: MediaEditorProject | null = null;
    private resizeListener = () => {
        this._handleResize()
    }


    async firstUpdated() {
        const projectList = await listAllProjects();
        this.projectList = projectList;
        window.addEventListener("resize", this.resizeListener)
    }

    disconnectedCallback(): void {
        window.removeEventListener("resize", this.resizeListener)
    }

    private _handleScroll() {
        if (this.scrollTimer) {
            clearTimeout(this.scrollTimer);
        }

        this.scrollbarStyle = `scrollbar-color: #888 transparent;`

        this.scrollTimer = setTimeout(() => {
            this.scrollbarStyle = "";
        }, 500)
    }

    private _closeMask() {
        this.isSubMenuVisible = false;
        this.subMenuStyle = "";
    }

    private _showSubMenu(ev: CustomEvent) {
        this.menuProjectConfig = ev.detail.project ?? null;
        this.menuElement = ev.detail.menuElement
        this.subMenuElement = this.shadowRoot?.querySelector('.sub-menu') ?? null;

        this.subMenuStyle = this._calcNewStyle()
        this.isSubMenuVisible = true;
    }

    private _handleResize() {
        if (this.isSubMenuVisible) {
            this.subMenuStyle = this._calcNewStyle();
        }
    }

    private _calcNewStyle() {
        const subMenuBoundingRect = this.subMenuElement?.getBoundingClientRect();
        const menuBoudingRect = this.menuElement?.getBoundingClientRect();
        if (!menuBoudingRect || !subMenuBoundingRect) {
            throw new Error('can not found menu div');
        }

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const x = menuBoudingRect.left;
        const y = menuBoudingRect.top;
        const subMenuWidth = subMenuBoundingRect.width;
        const subMenuHeight = subMenuBoundingRect.height;
        const subMenuRightBound = x + subMenuWidth;
        const subMenuBottomBound = y + subMenuHeight;

        return `${windowWidth >= subMenuRightBound ? "left: " + x + "px" : "left: " + (windowWidth - subMenuWidth) + "px"};${windowHeight >= subMenuBottomBound ? "top: " + y + "px" : "top: " + (windowHeight - subMenuHeight) + "px"}`;
    }

    private _rename() {

    }

    private async _copy() {
        if (!this.menuProjectConfig) {
            throw new Error("menu project config is null")
        }

        const newProject = await copyProject(this.menuProjectConfig);

        if (!newProject) {
            throw new Error("copy project can not be loaded")
        }

        this.projectList = [newProject, ...this.projectList]
        this._closeMask()
    }

    private _new(ev: CustomEvent) {
        const newProjectConfig = ev.detail.config
        this.projectList = [newProjectConfig, ...this.projectList]
    }

    private async _delete() {
        if (!this.menuProjectConfig) {
            throw new Error("menu project config is null")
        }

        await deleteProject(this.menuProjectConfig.metadata.name)

        this.projectList = this.projectList.filter(item => item.metadata.name !== this.menuProjectConfig?.metadata.name)
        console.log(this.projectList[0].metadata)
        this._closeMask()
    }

    render() {
        return html`
            <title-bar></title-bar>
            <main style=${this.scrollbarStyle} @scroll=${this._handleScroll}>
                <div class="project-container">
                    <create-project-card @newProject=${this._new}></create-project-card>
                    ${this.projectList.sort((a, b) => {
            return Date.parse(b.metadata.last_modified) - Date.parse(a.metadata.last_modified);
        }).map(project => html`<project-card .project=${project} @show-submenu=${this._showSubMenu}></project-card>`)}
                </div>
            </main>            
            <global-mask .visible=${this.isSubMenuVisible} @mask-closed=${this._closeMask}></global-mask>         
            <div class=${"sub-menu" + (this.isSubMenuVisible === true ? " visible" : "")} style=${this.subMenuStyle}>
                <div @click=${this._rename}>rename</div>
                <div @click=${this._copy}>copy</div>
                <div @click=${this._delete}>delete</div>
            </div>  
        `
    }
}