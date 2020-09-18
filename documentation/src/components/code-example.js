/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { __decorate } from "tslib";
import { LitElement, html, customElement, property, query, } from 'lit-element';
import * as Prism from 'prismjs';
import { toHtmlTemplateString } from '../utils/templates.js';
import Styles from './code-example.css';
import StylesLight from './code-example-light.css';
import StylesDark from './code-example-dark.css';
import { stripIndent } from 'common-tags';
import { FocusVisiblePolyfillMixin } from '@spectrum-web-components/shared';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-copy.js';
import { copyNode } from './copy-to-clipboard.js';
let CodeExample = class CodeExample extends FocusVisiblePolyfillMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.codeTheme = 'dark';
        this.shouldManageTabOrderForScrolling = () => {
            [this.markup, this.demo].map((el) => {
                if (!el)
                    return;
                const { offsetWidth, scrollWidth } = el;
                if (offsetWidth < scrollWidth) {
                    el.tabIndex = 0;
                }
                else {
                    el.removeAttribute('tabindex');
                }
            });
        };
    }
    static get styles() {
        return [Styles, StylesLight, StylesDark];
    }
    get code() {
        return stripIndent `${this.textContent}` || '';
    }
    get language() {
        if (this.classList.contains('language-javascript')) {
            return 'javascript';
        }
        return 'markup';
    }
    get showDemo() {
        return (this.classList.contains('language-html') ||
            this.classList.contains('language-html-live'));
    }
    get highlightedCode() {
        const highlightedHtml = Prism.highlight(this.code, Prism.languages[this.language], this.language);
        const code = toHtmlTemplateString(highlightedHtml);
        return html `
            <pre><code>${code}</code></pre>
        `;
    }
    get renderedCode() {
        if (this.classList.contains('language-html-live')) {
            const demo = document.createElement('div');
            demo.slot = 'demo';
            demo.innerHTML = this.code;
            this.append(demo);
        }
        return toHtmlTemplateString(this.code);
    }
    render() {
        const { highlightedCode, renderedCode } = this;
        return html `
            ${this.showDemo
            ? html `
                      <div class="demo-example">
                          <slot name="demo">${renderedCode}</slot>
                      </div>
                  `
            : undefined}
            <bdo id="markup" dir="ltr" class=${this.codeTheme}>
                ${highlightedCode}
                <div class="copy-holder">
                    <sp-action-button
                        class="copy"
                        @click=${this.copyToClipboard}
                        quiet
                    >
                        <sp-icon-copy slot="icon"></sp-icon-copy>
                        Copy to Clipboard
                    </sp-action-button>
                </div>
            </bdo>
        `;
    }
    copyToClipboard() {
        copyNode(this);
    }
    updated() {
        requestAnimationFrame(() => {
            this.shouldManageTabOrderForScrolling();
        });
    }
    trackTheme() {
        const queryThemeEvent = new CustomEvent('sp-track-theme', {
            bubbles: true,
            composed: true,
            detail: {
                callback: (color) => {
                    this.codeTheme = color.startsWith('light')
                        ? 'light'
                        : 'dark';
                },
            },
            cancelable: true,
        });
        this.dispatchEvent(queryThemeEvent);
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', this.shouldManageTabOrderForScrolling);
        this.trackTheme();
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this.shouldManageTabOrderForScrolling);
        this.trackTheme();
        super.disconnectedCallback();
    }
};
__decorate([
    query('#markup')
], CodeExample.prototype, "markup", void 0);
__decorate([
    query('.demo-example')
], CodeExample.prototype, "demo", void 0);
__decorate([
    property()
], CodeExample.prototype, "codeTheme", void 0);
CodeExample = __decorate([
    customElement('code-example')
], CodeExample);
export { CodeExample };
//# sourceMappingURL=code-example.js.map