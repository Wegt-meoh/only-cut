import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('not-found')
export class NotFound extends LitElement {
    static styles = css`
        main{
            display: flex;
            justify-content: center;
            align-items: center;            
            height: 100%;
        }

        :host{
            height: 100%
        }

        span{
            font-size: 2rem;            
        }
    `;

    render() {
        return html`
        <main>
            <span>Not found</span>
            <a href='/'>back</a>
        </main>
        `
    }
}