import page from 'page';
import "./components/title-bar";

/**
 * app router
 */
const loadedModules = new Set<string>();

function renderPage(tagName: string) {
    const container = document.getElementById('app');
    if (!container) {
        console.error('app-root is null');
        return;
    }

    if (loadedModules.has(tagName)) {
        container.innerHTML = `<${tagName}></${tagName}>`;
        return;
    }

    import(`./pages/${tagName}/index.ts`).then(() => {
        loadedModules.add(tagName);
        container.innerHTML = `<${tagName}></${tagName}>`;
    }).catch(error => {
        console.error(`can not found module for ${tagName}`, error);
    });
}

page('/', () => renderPage('start-up'));
page('/main-work', () => renderPage('main-work'));
page('*', () => renderPage('not-found'));
page.start();

/**
 * prevent default contextmenu
 */
window.addEventListener("contextmenu", (event) => {
    event.preventDefault(); // Prevent the default context menu
});
