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
import { html } from 'lit-element';
import '@spectrum-web-components/bundle/elements.js';
// work around while `top-nav` isn't "officially" in the bundle
import '@spectrum-web-components/top-nav/sp-top-nav.js';
import '@spectrum-web-components/top-nav/sp-top-nav-item.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-magnify.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-help.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-info.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-star.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-chevron-down.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-close.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-info.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-checkmark.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-checkmark-circle.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-alert.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-edit.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-more.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-settings.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-save-floppy.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-stopwatch.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-user-activity.js';
import { RouteComponent } from './route-component.js';
import markdownStyles from './markdown.css';
import componentStyles from './component.css';
import { AppRouter } from '../router.js';
import '@spectrum-web-components/tabs/sp-tab.js';
import '@spectrum-web-components/tabs/sp-tabs.js';
import '@spectrum-web-components/tabs/sp-tab-panel.js';
import docs from '../../custom-elements.json';
let ComponentDocs;
var TabValue;
(function (TabValue) {
    TabValue["Api"] = "api";
    TabValue["Examples"] = "examples";
})(TabValue || (TabValue = {}));
function sortByName(a, b) {
    if (!a.name || !b.name) {
        return 0;
    }
    if (a.name > b.name) {
        return 1;
    }
    if (b.name > a.name) {
        return -1;
    }
    return 0;
}
function buildTable(title, rowData, headings, cells) {
    if (!rowData.length) {
        return html ``;
    }
    return html `
        <div class="headerContainer">
            <h2 class="spectrum-Heading spectrum-Heading--sizeM">${title}</h2>
            <sp-divider size="s"></sp-divider>
        </div>
        <table class="spectrum-Table">
            <thead class="spectrum-Table-head">
                <tr>
                    ${headings.map((heading) => html `
                            <th class="spectrum-Table-headCell">${heading}</th>
                        `)}
                </tr>
            </thead>
            <tbody class="spectrum-Table-body">
                ${rowData.sort(sortByName).map((property) => html `
                        <tr class="spectrum-Table-row">
                            ${cells.map((cell) => html `
                                    <td class="spectrum-Table-cell">
                                        ${cell(property)}
                                    </td>
                                `)}
                        </tr>
                    `)}
            </tbody>
        </table>
    `;
}
class ComponentElement extends RouteComponent {
    constructor() {
        super(...arguments);
        this.docsLoaded = false;
    }
    static get styles() {
        return [markdownStyles, componentStyles];
    }
    get componentName() {
        if (this.location) {
            return this.location.params.component;
        }
        return '';
    }
    get apiDocs() {
        let prefixedEl;
        docs.find((jsModule) => {
            prefixedEl = jsModule.declarations.find((jsDeclarations) => {
                return (jsDeclarations.tagName === `sp-${this.componentName}` ||
                    (this.location &&
                        jsDeclarations.tagName ===
                            this.location.params.component));
            });
            return prefixedEl || false;
        });
        return prefixedEl || undefined;
    }
    get tab() {
        if (this.location && this.location.params.tab === 'api') {
            return TabValue.Api;
        }
        return TabValue.Examples;
    }
    handleTabChange(event) {
        if (!this.location || !event.target)
            return;
        const target = event.target;
        const selected = target.selected;
        AppRouter.changeParams({
            component: this.location.params.component,
            tab: selected,
        });
    }
    loadDocs() {
        import('../../components/index.js').then((module) => {
            ComponentDocs = module.ComponentDocs;
            this.docsLoaded = true;
            this.requestUpdate();
        });
    }
    shouldUpdate() {
        if (!this.docsLoaded) {
            this.loadDocs();
        }
        return this.docsLoaded;
    }
    render() {
        let result;
        if (this.location && this.location.params) {
            const APIdocs = this.apiDocs;
            const componentDocs = ComponentDocs.get(this.location.params.component);
            result = html `
                <article class="spectrum-Typography">
                    <div id="title-header">
                        <h1
                            class="spectrum-Heading spectrum-Heading--sizeXXL spectrum-Heading--serif"
                            id="component-name"
                        >
                            ${APIdocs ? APIdocs.tagName : this.componentName}
                        </h1>
                    </div>
                    ${APIdocs && componentDocs
                ? html `
                              <sp-tabs
                                  selected="${this.tab}"
                                  @change="${this.handleTabChange}"
                                  direction="horizontal"
                                  aria-labelledby="component-name"
                              >
                                  <sp-tab
                                      value="examples"
                                      label="Examples"
                                  ></sp-tab>
                                  <sp-tab value="api" label="API"></sp-tab>
                              </sp-tabs>
                          `
                : html ``}
                    ${componentDocs && this.tab === TabValue.Examples
                ? componentDocs
                : this.renderDocs(APIdocs)}
                </article>
            `;
        }
        return result || html ``;
    }
    renderDocs(tag) {
        if (!tag)
            return html ``;
        return html `
            <p>${tag.description}</p>
            ${tag.attributes && tag.attributes.length
            ? buildTable('Attributes and Properties', tag.attributes, [
                'Property',
                'Attribute',
                'Type',
                'Default',
                'Description',
            ], [
                (attribute) => html `
                                  <code>${attribute.fieldName}</code>
                              `,
                (attribute) => html `
                                  <code>${attribute.name || ''}</code>
                              `,
                (attribute) => {
                    var _a;
                    return html `
                                  <code>${((_a = attribute.type) === null || _a === void 0 ? void 0 : _a.text) || ''}</code>
                              `;
                },
                (attribute) => html `
                                  <code>${attribute.default || ''}</code>
                              `,
                (attribute) => html `
                                  ${attribute.description || ''}
                              `,
            ])
            : html ``}
            ${tag.slots && tag.slots.length
            ? buildTable('Slots', tag.slots, ['Name', 'Description'], [
                (property) => html `
                                  <code>
                                      ${property.name || 'default slot'}
                                  </code>
                              `,
                (property) => html `
                                  ${property.description || ''}
                              `,
            ])
            : html ``}
            ${tag.events && tag.events.length
            ? buildTable('Events', tag.events.filter((tag) => tag
                .privacy !== 'private'), ['Name', 'Description'], [
                (property) => html `
                                  <code>${property.name}</code>
                              `,
                (property) => html `
                                  <code>${property.description || ''}</code>
                              `,
            ])
            : html ``}
            ${tag.cssProperties && tag.cssProperties.length
            ? buildTable('CSS Custom Properties', tag.cssProperties, ['Name', 'Default'], [
                (property) => html `
                                  <code>${property.name}</code>
                              `,
                (property) => html `
                                  <code>${property.default || '""'}</code>
                              `,
            ])
            : html ``}
        `;
    }
}
customElements.define('docs-component', ComponentElement);
class StyledElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background-color: var(--spectrum-global-color-gray-50);
                    color: var(--spectrum-global-color-gray-800);
                    border: 1px solid;
                    padding: 2em;
                }
            </style>
            <slot></slot>
        `;
    }
}
customElements.define('styled-element', StyledElement);
//# sourceMappingURL=component.js.map