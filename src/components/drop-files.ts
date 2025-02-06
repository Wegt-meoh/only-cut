import { open } from '@tauri-apps/plugin-dialog'
import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import "../components/title-bar.ts"
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

@customElement('drop-files')
export class DropFiles extends LitElement {

    static styles = css`
        :host{
            user-select: none;
            border: dashed var(--grey-color) 3px;
            border-radius: 20px;
            width: 300px;
            height: 80px;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 2rem;
        }

        :host:hover{
            background: var(--active-grey-color);            
        }
    `

    private unlisten: UnlistenFn | null = null;

    connectedCallback(): void {
        super.connectedCallback();
        listen<string>('tauri://drag-drop', e => {
            invoke('import-files', { paths: [e.payload] })
        }).then(unlisten => {
            this.unlisten = unlisten;
        })
    }

    disconnectedCallback(): void {
        super.disconnectedCallback()
        if (this.unlisten) {
            console.log('unlisten drag and drop')
            this.unlisten();
            this.unlisten = null;
        }
    }

    private async _selectFiles() {
        try {
            const selected = await open({
                multiple: true, // Allow selecting only one file
                filters: [
                    { name: 'Image', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'tiff', 'webp', 'raw'] },
                    { name: 'Audio', extensions: ['mp3', 'aac', 'wav', 'flac', 'ogg', 'aiff', 'opus'] },
                    { name: 'Video', extensions: ['mp4', 'mkv', 'avi', 'mov', 'flv', 'webm', 'wmv'] }
                ],
            });

            if (selected) {
                invoke('import-files', { paths: [...selected] })
            }
        } catch (error) {
            console.error('Error selecting file:', error);
        }
    }

    render() {
        return html`                        
            <div @click="${this._selectFiles}">
                drop file(s) here
            </div>        
        `
    }
}