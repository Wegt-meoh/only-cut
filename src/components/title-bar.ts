import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getCurrentWindow, LogicalPosition, PhysicalPosition, PhysicalSize } from '@tauri-apps/api/window';
import { getOS, throttle } from '../utils/common';

@customElement('title-bar')
export class Titlebar extends LitElement {
    static styles = css`
    :host {                
        height: 30px;
        background: var(--dark-bg-color);
        user-select: none;
        display: flex;
        justify-content: space-between;
        -webkit-user-select: none;  /* Safari & older Chrome */
        -moz-user-select: none;     /* Firefox */
        -ms-user-select: none;      /* Internet Explorer/Edge */
        user-select: none;
        border-bottom: 1px solid var(--grey-color);
        z-index: 10;
        cursor: default;
    }

    .titlebar-button {        
        width: 30px;
        display: inline-block;
    }

    .titlebar-button>svg{
        display: block;
    }

    .titlebar-button:hover {
        background: var(--active-grey-color);
    }

    #drag-area{        
        flex: 1;
    }

    .logo{
        display: flex;
        align-items: center;
        font-weight: bold;
    }
  `;

    @state() private isMaximize: boolean = false;
    private readyToDragging: boolean = false;
    private isDragging: boolean = false;
    private currentWindow = getCurrentWindow();
    private dragStartRatio = 0;
    private prevWindowState = {
        width: 0,
        height: 0,
        x: 0,
        y: 0
    }
    private abortController = new AbortController();

    async firstUpdated() {
        this.isMaximize = await this.currentWindow.isMaximized()
        window.addEventListener("mouseup", this._handleMouseUp, { signal: this.abortController.signal })
        window.addEventListener("mousemove", throttle(this._handleMouseMove, 1000 / 120), { signal: this.abortController.signal })
    }

    disconnectedCallback() {
        this.abortController.abort()
    }

    private _windowMinimize = async () => {
        await this.currentWindow.minimize()
        this.isMaximize = false
    }

    private _windowClose = async () => {
        this.currentWindow.close();
    }

    private async _toggleMaximizeAndFullscreen() {
        if (await this.currentWindow.isFullscreen()) {
            await this.currentWindow.setFullscreen(false)
            this.isMaximize = false
        } else if (await this.currentWindow.isMaximized()) {
            await this._unmaximize()
            this.isMaximize = false
        } else {
            await this._maximize()
            this.isMaximize = true
        }
    }

    private _handleMouseMove = async (ev: MouseEvent) => {
        if (!this.readyToDragging) {
            return;
        }

        if (!this.isDragging) {
            this.isDragging = true;
            const { screenX: sx } = ev;
            const outerPosition = await this.currentWindow.outerPosition()

            this.dragStartRatio = (sx - outerPosition.x / window.devicePixelRatio) / window.innerWidth;
            if (this.isMaximize) {
                requestAnimationFrame(() => {
                    this._toggleMaximizeAndFullscreen()
                })
            }
        }

        const { screenX: sx, screenY: sy } = ev;
        requestAnimationFrame(() => {
            this.currentWindow.setPosition(new LogicalPosition(sx - window.innerWidth * this.dragStartRatio, sy - 15))
        })

    }

    private _handleMouseDown = (ev: MouseEvent) => {
        if (ev.detail === 1) {
            this.readyToDragging = true;
            this.isDragging = false;
            return;
        }

        this._toggleMaximizeAndFullscreen();
    }

    private _handleMouseUp = () => {
        this.readyToDragging = false;
        this.isDragging = false;
    }

    private _maximize = async () => {
        const { width, height } = await this.currentWindow.outerSize()
        const { x, y } = await this.currentWindow.outerPosition()
        this.prevWindowState = {
            width,
            height,
            x,
            y
        }
        await this.currentWindow.setPosition(new LogicalPosition(0, 0))
        await this.currentWindow.setSize(new PhysicalSize(window.screen.width * window.devicePixelRatio, window.screen.height * window.devicePixelRatio))
    }

    private _unmaximize = async () => {
        await this.currentWindow.setSize(new PhysicalSize(this.prevWindowState.width, this.prevWindowState.height))
        await this.currentWindow.setPosition(new PhysicalPosition(this.prevWindowState.x, this.prevWindowState.y))
    }

    render() {
        const os = getOS();
        if (os === "macOS") {
            return html`
            <div id='drag-area' @mousedown=${this._handleMouseDown}></div>
            `
        }
        return html`
            <div class="logo">                
                ${logoSvgTemplate}
                <span>Only Cut</span>
            </div>
            <div id='drag-area' @mousemove="${this._handleMouseMove}"  @mousedown="${this._handleMouseDown}"></div>
            <div class="button-group">
                <div class="titlebar-button" @click="${this._windowMinimize}">            
                    ${minimizeSvgTemplate}
                </div>
                <div class="titlebar-button"  @click="${this._toggleMaximizeAndFullscreen}">                
                    ${this.isMaximize ? restoreSvgTemplate : maximizeSvgTemplate}
                </div>                
                <div class="titlebar-button" @click="${this._windowClose}">
                    ${closeSvgTemplate}
                </div>
            </div>
    `;
    }
}

const logoSvgTemplate = html`<svg fill="currentColor" width="30px" height="30px" viewBox="-8.64 -8.64 49.28 49.28" xmlns="http://www.w3.org/2000/svg" stroke="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M30.4,25.42a4.92,4.92,0,0,0-7.71-2.25L17.63,19.3l.26-.2,3.81,2.09a1,1,0,0,0,.48.12,1,1,0,0,0,.88-.52L30,7.93A5.61,5.61,0,0,0,27.79.31L27.45.12A1.08,1.08,0,0,0,26.68,0a1,1,0,0,0-.59.48L17,17.25,16,18l-1-.79L5.9.52A1,1,0,0,0,5.3,0a1,1,0,0,0-.76.08L4.19.31A5.61,5.61,0,0,0,2,7.92l7,12.87a1,1,0,0,0,.6.48.86.86,0,0,0,.28,0,1,1,0,0,0,.48-.12l3.81-2.09.26.2-5,3.87A5.27,5.27,0,0,0,8,22.43a5,5,0,0,0-6.24,6.82,4.94,4.94,0,0,0,2.82,2.58,5.11,5.11,0,0,0,1.71.31,5,5,0,0,0,4.7-3.3A4.92,4.92,0,0,0,10.81,25a3,3,0,0,0-.2-.34L16,20.56l5.38,4.12c-.06.12-.14.22-.2.34a5,5,0,1,0,9.23.4Zm-3.06-23a3.56,3.56,0,0,1,1.22,1.81A3.62,3.62,0,0,1,28.26,7L21.78,19l-2.63-1.44ZM10.2,19,3.72,7a3.61,3.61,0,0,1,.92-4.55l8.19,15.1ZM9.1,28.16a3,3,0,0,1-1.55,1.69,3,3,0,0,1-4.09-3.74A3,3,0,0,1,5,24.41a3.16,3.16,0,0,1,1.27-.28,3.1,3.1,0,0,1,1,.18A3,3,0,0,1,9.1,28.16ZM26.73,30a3,3,0,0,1-2.3-.1,3,3,0,0,1,1.27-5.72,3,3,0,0,1,1,5.82Z"></path> </g></svg>`
const minimizeSvgTemplate = html`<svg width="30px" height="30px" viewBox="-5.76 -5.76 35.52 35.52" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracurrentColorerCarrier" stroke-linecurrentcap="round" stroke-linejoin="round"></g><g id="SVGRepo_icurrentColoronCarrier"> <title>minimize_fill</title> <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="System" transform="translate(-192.000000, -240.000000)"> <g id="minimize_fill" transform="translate(192.000000, 240.000000)"> <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero"> </path> <path d="M2.5,12 C2.5,11.1716 3.17157,10.5 4,10.5 L20,10.5 C20.8284,10.5 21.5,11.1716 21.5,12 C21.5,12.8284 20.8284,13.5 20,13.5 L4,13.5 C3.17157,13.5 2.5,12.8284 2.5,12 Z" id="路径" fill="currentColor"> </path> </g> </g> </g> </g></svg>`
const maximizeSvgTemplate = html`<svg width="30px" height="30px" viewBox="-9.6 -9.6 43.20 43.20" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></rect> </g></svg>`
const restoreSvgTemplate = html`<svg width="20px" height="20px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.08496 4C5.29088 3.4174 5.8465 3 6.49961 3H9.99961C11.6565 3 12.9996 4.34315 12.9996 6V9.5C12.9996 10.1531 12.5822 10.7087 11.9996 10.9146V6C11.9996 4.89543 11.1042 4 9.99961 4H5.08496Z" fill="currentColor"></path> <path d="M4.5 5H9.5C10.3284 5 11 5.67157 11 6.5V11.5C11 12.3284 10.3284 13 9.5 13H4.5C3.67157 13 3 12.3284 3 11.5V6.5C3 5.67157 3.67157 5 4.5 5ZM4.5 6C4.22386 6 4 6.22386 4 6.5V11.5C4 11.7761 4.22386 12 4.5 12H9.5C9.77614 12 10 11.7761 10 11.5V6.5C10 6.22386 9.77614 6 9.5 6H4.5Z" fill="currentColor"></path> </g></svg>`
const closeSvgTemplate = html`<svg width="30px" height="30px" viewBox="-12 -12 48.00 48.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracurrentColorerCarrier" stroke-linecurrentcap="round" stroke-linejoin="round"></g><g id="SVGRepo_icurrentColoronCarrier"> <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="currentColor"></path> </g></svg>`