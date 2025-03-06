import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "../components/project-card.ts"
import "../components/title-bar.ts"
import "../components/create-project-card.ts"
import { copyProject, deleteProject, listAllProjects, renameProject } from "../utils/config-manager.ts";
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
            gap: 28px;
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

        .visible{            
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

        input{
            font-family: "Times New Roman";
            color: var(--light-grey-color);
            position: fixed;
            top: -100px;
            left: 0;            
            border: none;
            outline: none;
            font-size: 16px;
            padding: 0;
            line-height: 20px;
            background: var(--dark-bg-color);
        }
    `

    @state() private projectList: MediaEditorProject[] = [];
    @state() private scrollbarStyle = ""; // used for scrollbar style
    @state() private isSubMenuVisible: boolean = false;
    @state() private subMenuStyle = "";
    @state() private inputStyle = "";
    @state() private renaming = false;
    private scrollTimer?: number;
    private nameElement?: HTMLDivElement;
    private menuElement?: HTMLDivElement;
    private subMenuElement?: HTMLDivElement;
    private focusedProject?: MediaEditorProject;
    private inputElemnt?: HTMLInputElement;
    private resizeListener = () => {
        this._handleResize()
    }

    async firstUpdated() {
        this.projectList = await listAllProjects();

        this.inputElemnt = this.shadowRoot?.querySelector("input") ?? undefined
        this.subMenuElement = this.shadowRoot?.querySelector('.sub-menu') ?? undefined;

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

        if (this.renaming) {
            this.inputStyle = this._calcInputStyle()
        }
    }

    private _closeMask() {
        this.isSubMenuVisible = false;
        this.subMenuStyle = "";
    }

    private _showSubMenu(ev: CustomEvent) {
        this.nameElement = ev.detail.nameElement;
        this.focusedProject = ev.detail.project;
        this.menuElement = ev.detail.menuElement;

        this.subMenuStyle = this._calcSubMenuStyle()
        this.isSubMenuVisible = true;
    }

    private _handleResize() {
        if (this.isSubMenuVisible) {
            this.subMenuStyle = this._calcSubMenuStyle();
        }
    }

    private _calcSubMenuStyle() {
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

    private _calcInputStyle() {
        const nameElementRect = this.nameElement?.getBoundingClientRect()

        if (!nameElementRect) {
            throw new Error("name element rect is undefined")
        }

        return `width:${nameElementRect.width - 4}px;left:${nameElementRect.left}px;top:${nameElementRect.top}px`
    }

    private async _copy() {
        if (!this.focusedProject) {
            throw new Error("menu project config or name is undefined")
        }

        const newProject = await copyProject(this.focusedProject);

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
        if (!this.focusedProject) {
            throw new Error("menu project config or name is undefined")
        }

        await deleteProject(this.focusedProject.name)

        this.projectList = this.projectList.filter(item => item.name !== this.focusedProject?.name)
        this._closeMask()
    }

    private _rename() {
        if (!this.inputElemnt) {
            throw new Error("input element is undefined")
        }

        if (!this.focusedProject) {
            throw new Error("focused project is undefined")
        }

        this.renaming = true
        this._closeMask()
        this.inputElemnt.value = this.focusedProject.name
        this.inputElemnt.focus()
        this.inputElemnt.setSelectionRange(0, this.inputElemnt.value.length)
        this.inputStyle = this._calcInputStyle()
    }

    private async _handleInputBlur() {
        this.renaming = false

        if (!this.inputElemnt) {
            throw new Error("input element is undefined")
        }

        const newName = this.inputElemnt.value
        if (newName.length <= 0) {
            return;
        }

        if (!this.focusedProject) {
            throw new Error("menu project config is undefined")
        }

        if (!this.projectList.every(p => p.name !== newName)) {
            return;
        }

        await renameProject(this.focusedProject.name, newName);
        this.projectList = [...this.projectList.filter(item => item !== this.focusedProject), { ...this.focusedProject, name: newName }]
    }

    render() {
        const sortedList = this.projectList.sort((a, b) => {
            return Date.parse(b.config.metadata.last_modified) - Date.parse(a.config.metadata.last_modified);
        }).map(project => {
            console.log(Date.parse(project.config.metadata.last_modified))
            return html`<project-card .project=${project} @show-submenu=${this._showSubMenu}></project-card>`
        })

        return html`
            <title-bar></title-bar>
            <main style=${this.scrollbarStyle} @scroll=${this._handleScroll}>
                <div class="project-container">
                    <create-project-card @newProject=${this._new}></create-project-card>
                    ${sortedList}
                </div>
            </main>            
            <global-mask .visible=${this.isSubMenuVisible} @mask-closed=${this._closeMask}></global-mask>         
            <div class=${"sub-menu" + (this.isSubMenuVisible === true ? " visible" : "")} style=${this.subMenuStyle}>
                <div @click=${this._rename}>rename</div>
                <div @click=${this._copy}>copy</div>
                <div @click=${this._delete}>delete</div>
            </div>  
            <input type="text" @blur=${this._handleInputBlur} style=${this.renaming ? this.inputStyle : ""}>
        `
    }
}