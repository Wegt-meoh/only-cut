import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('main-work')
export class MainWork extends LitElement {
    private href = window.location.href
    private projectName = this.href.slice(this.href.indexOf("name=") + 5)

    render() {
        return html`
        open project name = ${this.projectName}
        `
    }
}