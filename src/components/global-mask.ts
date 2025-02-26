import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('global-mask')
export class GlobalMask extends LitElement {
    static styles = css`
        .mask {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.3);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            display:none;
            transition: opacity 0.3s ease;
        }

        .mask.visible {
            display: block;
        }

        .mask-content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
    `;

    @property({ type: Boolean })
    visible = false;

    render() {
        return html`
            <div class="mask ${this.visible ? 'visible' : ''}" @click=${this.handleMaskClick}></div>
        `;
    }

    handleMaskClick(event: Event) {
        if (event.target === this.shadowRoot?.querySelector('.mask')) {
            this.hideMask();
        }

        event.stopPropagation()
    }

    hideMask() {
        this.visible = false;
        this.dispatchEvent(new CustomEvent('mask-closed'));
    }
}