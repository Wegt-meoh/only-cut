import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("seperation-line")
export class SeperationLine extends LitElement {
    static styles = css`
        :host{
            display: inline-block;
            height: 100%;
            border-left: 1px solid var(--grey-color);
        }
    `;

    render() {
        return html``;
    }
}
