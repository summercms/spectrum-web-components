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
import { html, property, SpectrumElement, } from '@spectrum-web-components/base';
import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/src/themes.js';
import './side-nav.js';
import layoutStyles from './layout.css';
import '@spectrum-web-components/field-label/sp-field-label.js';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/toast/sp-toast.js';
const SWC_THEME_COLOR_KEY = 'swc-docs:theme:color';
const SWC_THEME_SCALE_KEY = 'swc-docs:theme:scale';
const SWC_THEME_DIR_KEY = 'swc-docs:theme:dir';
const COLOR_FALLBACK = matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
const SCALE_MEDIUM = 'medium';
const DIR_FALLBACK = 'ltr';
const DEFAULT_COLOR = (window.localStorage
    ? localStorage.getItem(SWC_THEME_COLOR_KEY) || COLOR_FALLBACK
    : COLOR_FALLBACK);
const DEFAULT_SCALE = (window.localStorage
    ? localStorage.getItem(SWC_THEME_SCALE_KEY) || SCALE_MEDIUM
    : SCALE_MEDIUM);
const DEFAULT_DIR = (window.localStorage
    ? localStorage.getItem(SWC_THEME_DIR_KEY) || DIR_FALLBACK
    : DIR_FALLBACK);
const isNarrowMediaQuery = matchMedia('screen and (max-width: 960px)');
export class LayoutElement extends SpectrumElement {
    constructor() {
        super(...arguments);
        this.alerts = new Map();
        this.color = DEFAULT_COLOR;
        this.dir = DEFAULT_DIR;
        this.open = false;
        this.isNarrow = isNarrowMediaQuery.matches;
        this.scale = DEFAULT_SCALE;
        this._themeTrackers = new Map();
        this.handleMatchMediaChange = (event) => {
            this.isNarrow = event.matches;
        };
    }
    static get styles() {
        return [layoutStyles];
    }
    toggleNav() {
        this.open = !this.open;
    }
    closeNav() {
        this.open = false;
    }
    updateColor(event) {
        this.color = event.target.value;
        this._themeTrackers.forEach((tracker) => tracker(this.color));
    }
    updateScale(event) {
        this.scale = event.target.value;
    }
    updateDirection(event) {
        const dir = event.target.value;
        this.dir = dir === 'rtl' ? dir : 'ltr';
    }
    handleTrackTheme(event) {
        const target = event.composedPath()[0];
        if (this._themeTrackers.has(target)) {
            this._themeTrackers.delete(target);
        }
        else {
            this._themeTrackers.set(target, event.detail.callback);
            const callback = this._themeTrackers.get(target);
            if (callback) {
                callback(this.color);
            }
        }
    }
    addAlert(event) {
        const target = event.composedPath()[0];
        if (!this.alerts.has(target)) {
            const close = () => {
                this.alerts.delete(target);
                target.focus();
                this.requestUpdate();
            };
            this.alerts.set(target, {
                count: 0,
                message: '',
                /**
                 * <sp-toast> does not allow a `timeout` of less that 6000
                 * use this as a cheat to reset the timeout to 6000 for
                 * every additional alert.
                 */
                element: (count, message) => html `
                    <sp-toast
                        .timeout=${count}
                        variant="info"
                        @close=${close}
                        open
                    >
                        ${message} ${count > 1 ? `(${count} alerts)` : ''}
                    </sp-toast>
                `,
            });
        }
        const alert = this.alerts.get(target);
        this.alerts.set(target, {
            element: alert.element,
            count: alert.count + 1,
            message: event.detail.message,
        });
        this.requestUpdate();
    }
    renderContent() {
        return html `
            <div></div>
        `;
    }
    render() {
        return html `
            <sp-theme
                color=${this.color}
                scale=${this.scale}
                dir=${this.dir}
                id="app"
                @sp-track-theme=${this.handleTrackTheme}
            >
                <header>
                    <sp-action-button
                        quiet
                        label="Open Navigation"
                        @click=${this.toggleNav}
                    >
                        <svg
                            slot="icon"
                            viewBox="0 0 36 36"
                            focusable="false"
                            aria-hidden="true"
                            width="22"
                            height="22"
                            fill="currentColor"
                        >
                            <rect
                                height="4"
                                rx="1"
                                ry="1"
                                width="28"
                                x="4"
                                y="16"
                            ></rect>
                            <rect
                                height="4"
                                rx="1"
                                ry="1"
                                width="28"
                                x="4"
                                y="6"
                            ></rect>
                            <rect
                                height="4"
                                rx="1"
                                ry="1"
                                width="28"
                                x="4"
                                y="26"
                            ></rect>
                        </svg>
                    </sp-action-button>
                </header>
                <div id="body">
                    <docs-side-nav
                        id="side-nav"
                        ?inert=${this.isNarrow && !this.open}
                        ?open=${this.open}
                        @close=${this.closeNav}
                    ></docs-side-nav>
                    <main
                        id="layout-content"
                        ?inert=${this.isNarrow && this.open}
                        role="main"
                    >
                        <div id="page" @alert=${this.addAlert}>
                            <div class="manage-theme">
                                <sp-field-label
                                    for="theme-color"
                                    side-aligned="start"
                                >
                                    Theme
                                </sp-field-label>
                                <sp-picker
                                    id="theme-color"
                                    placement="bottom"
                                    quiet
                                    value=${this.color}
                                    @change=${this.updateColor}
                                >
                                    <sp-menu-item value="lightest">
                                        Lightest
                                    </sp-menu-item>
                                    <sp-menu-item value="light">
                                        Light
                                    </sp-menu-item>
                                    <sp-menu-item value="dark">
                                        Dark
                                    </sp-menu-item>
                                    <sp-menu-item value="darkest">
                                        Darkest
                                    </sp-menu-item>
                                </sp-picker>
                                <sp-field-label
                                    for="theme-scale"
                                    side-aligned="start"
                                >
                                    Scale
                                </sp-field-label>
                                <sp-picker
                                    id="theme-scale"
                                    label="Scale"
                                    placement="bottom"
                                    quiet
                                    value=${this.scale}
                                    @change=${this.updateScale}
                                >
                                    <sp-menu-item value="medium">
                                        Medium
                                    </sp-menu-item>
                                    <sp-menu-item value="large">
                                        Large
                                    </sp-menu-item>
                                </sp-picker>
                                <sp-field-label
                                    for="theme-direction"
                                    side-aligned="start"
                                >
                                    Direction
                                </sp-field-label>
                                <sp-picker
                                    id="theme-direction"
                                    label="Direction"
                                    placement="bottom"
                                    quiet
                                    value=${this.dir}
                                    @change=${this.updateDirection}
                                >
                                    <sp-menu-item value="ltr">LTR</sp-menu-item>
                                    <sp-menu-item value="rtl">RTL</sp-menu-item>
                                </sp-picker>
                            </div>
                            ${this.renderContent()}
                        </div>
                    </main>
                </div>
                ${this.alerts.size
            ? html `
                          <div class="alerts" role="region">
                              ${[...this.alerts.values()].map((alert) => alert.element(alert.count, alert.message))}
                          </div>
                      `
            : html ``}
            </sp-theme>
        `;
    }
    updated(changes) {
        if (changes.has('color') && window.localStorage) {
            localStorage.setItem(SWC_THEME_COLOR_KEY, this.color);
        }
        if (changes.has('scale') && window.localStorage) {
            localStorage.setItem(SWC_THEME_SCALE_KEY, this.scale);
        }
        if (changes.has('dir') && window.localStorage) {
            localStorage.setItem(SWC_THEME_DIR_KEY, this.dir);
        }
    }
    connectedCallback() {
        super.connectedCallback();
        import('./code-example.js');
        isNarrowMediaQuery.addEventListener('change', this.handleMatchMediaChange);
    }
    disconnectedCallback() {
        isNarrowMediaQuery.removeEventListener('change', this.handleMatchMediaChange);
    }
}
__decorate([
    property({ attribute: false })
], LayoutElement.prototype, "alerts", void 0);
__decorate([
    property({ attribute: false })
], LayoutElement.prototype, "color", void 0);
__decorate([
    property({ reflect: true })
], LayoutElement.prototype, "dir", void 0);
__decorate([
    property({ type: Boolean })
], LayoutElement.prototype, "open", void 0);
__decorate([
    property({ type: Boolean, attribute: false })
], LayoutElement.prototype, "isNarrow", void 0);
__decorate([
    property({ attribute: false })
], LayoutElement.prototype, "scale", void 0);
//# sourceMappingURL=layout.js.map