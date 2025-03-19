import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('file-explorer')
export class FileExplorer extends LitElement {
    static styles = css`
       
    `;

    render() {
        return html`
        this is file explorer
        `
    }
}