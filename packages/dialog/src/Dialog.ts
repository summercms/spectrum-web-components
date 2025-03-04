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

import {
    html,
    SpectrumElement,
    CSSResultArray,
    TemplateResult,
    property,
    query,
    ifDefined,
    PropertyValues,
} from '@spectrum-web-components/base';

import '@spectrum-web-components/divider/sp-divider.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/button-group/sp-button-group.js';
import crossStyles from '@spectrum-web-components/icon/src/spectrum-icon-cross.css.js';
import '@spectrum-web-components/icons-ui/icons/sp-icon-cross500.js';
import '@spectrum-web-components/icons-workflow/icons/sp-icon-alert.js';
import {
    ObserveSlotPresence,
    FocusVisiblePolyfillMixin,
} from '@spectrum-web-components/shared';

import styles from './dialog.css.js';

/**
 * @element sp-dialog
 *
 * @slot hero - Accepts a hero image to display at the top of the dialog
 * @slot heading - Acts as the heading of the dialog. This should be an actual heading tag `<h1-6 />`
 * @slot - Content not addressed to a specific slot will be interpreted as the main content of the dialog
 * @slot footer - Content addressed to the `footer` will be placed below the main content and to the side of any `[slot='button']` content
 * @slot button - Button elements addressed to this slot may be placed below the content when not delivered in a fullscreen mode
 * @fires close - Announces that the dialog has been closed.
 */
export class Dialog extends FocusVisiblePolyfillMixin(
    ObserveSlotPresence(SpectrumElement, [
        '[slot="hero"]',
        '[slot="footer"]',
        '[slot="button"]',
    ])
) {
    public static get styles(): CSSResultArray {
        return [styles, crossStyles];
    }

    @query('.content')
    private contentElement!: HTMLDivElement;

    @property({ type: Boolean, reflect: true })
    public error = false;

    @property({ type: Boolean, reflect: true })
    public dismissable = false;

    protected get hasFooter(): boolean {
        return this.getSlotContentPresence('[slot="footer"]');
    }

    protected get hasButtons(): boolean {
        return this.getSlotContentPresence('[slot="button"]');
    }

    protected get hasHero(): boolean {
        return this.getSlotContentPresence('[slot="hero"]');
    }

    @property({ type: Boolean, reflect: true, attribute: 'no-divider' })
    public noDivider = false;

    @property({ type: String, reflect: true })
    public mode?: 'fullscreen' | 'fullscreenTakeover';

    @property({ type: String, reflect: true })
    public size?: 's' | 'm' | 'l';

    public focus(): void {
        if (this.shadowRoot) {
            const firstFocusable = this.shadowRoot.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [focusable]'
            ) as SpectrumElement;
            if (firstFocusable) {
                if (firstFocusable.updateComplete) {
                    firstFocusable.updateComplete.then(() =>
                        firstFocusable.focus()
                    );
                    /* c8 ignore next 3 */
                } else {
                    firstFocusable.focus();
                }
                this.removeAttribute('tabindex');
            }
            /* c8 ignore next 3 */
        } else {
            super.focus();
        }
    }

    public close(): void {
        this.dispatchEvent(
            new Event('close', {
                bubbles: true,
            })
        );
    }

    protected render(): TemplateResult {
        return html`
            <div class="grid">
                <slot name="hero"></slot>
                <slot
                    name="heading"
                    class=${ifDefined(this.hasHero ? this.hasHero : undefined)}
                ></slot>
                ${this.error
                    ? html`
                          <sp-icon-alert class="type-icon"></sp-icon-alert>
                      `
                    : html``}
                ${this.noDivider
                    ? html``
                    : html`
                          <sp-divider size="m" class="divider"></sp-divider>
                      `}
                <div class="content">
                    <slot @slotchange=${this.onContentSlotChange}></slot>
                </div>
                ${this.hasFooter
                    ? html`
                          <div class="footer">
                              <slot name="footer"></slot>
                          </div>
                      `
                    : html``}
                ${this.hasButtons
                    ? html`
                          <sp-button-group
                              class="buttonGroup ${this.hasFooter
                                  ? ''
                                  : 'buttonGroup--noFooter'}"
                          >
                              <slot name="button"></slot>
                          </sp-button-group>
                      `
                    : html``}
                ${this.dismissable
                    ? html`
                          <sp-action-button
                              class="close-button"
                              label="Close"
                              quiet
                              size="m"
                              @click=${this.close}
                          >
                              <sp-icon-cross500
                                  class="spectrum-UIIcon-Cross500"
                                  slot="icon"
                              ></sp-icon-cross500>
                          </sp-action-button>
                      `
                    : html``}
            </div>
        `;
    }

    public shouldManageTabOrderForScrolling = (): void => {
        const { offsetHeight, scrollHeight } = this.contentElement;
        if (offsetHeight < scrollHeight) {
            this.contentElement.tabIndex = 0;
        } else {
            this.contentElement.removeAttribute('tabindex');
        }
    };

    protected shouldUpdate(changes: PropertyValues): boolean {
        if (changes.has('mode') && !!this.mode) {
            this.dismissable = false;
        }
        if (changes.has('dismissable') && this.dismissable) {
            this.dismissable = !this.mode;
        }
        return super.shouldUpdate(changes);
    }

    protected onContentSlotChange(): void {
        this.shouldManageTabOrderForScrolling();
    }

    public connectedCallback(): void {
        super.connectedCallback();
        window.addEventListener(
            'resize',
            this.shouldManageTabOrderForScrolling
        );
    }

    public disconnectedCallback(): void {
        window.removeEventListener(
            'resize',
            this.shouldManageTabOrderForScrolling
        );
        super.disconnectedCallback();
    }
}
