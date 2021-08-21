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
    CSSResultArray,
    TemplateResult,
    PropertyValues,
    html,
    ifDefined,
    property,
} from '@spectrum-web-components/base';
import { Menu } from '@spectrum-web-components/menu';
import { Popover } from '@spectrum-web-components/popover';
import { PickerBase } from '@spectrum-web-components/picker';
import { ActionButton } from '@spectrum-web-components/action-button';
import { ObserveSlotText } from '@spectrum-web-components/shared/src/observe-slot-text.js';
import { IconMore } from '@spectrum-web-components/icons-workflow/src/elements/IconMore.js';
import actionMenuStyles from './action-menu.css.js';

/**
 * @element sp-action-menu
 * @slot icon - The icon to use for action button
 * @slot label - The label to use on for the action button
 * @attr selects - By default `sp-action-menu` does not manage a selection. If
 *   you'd like for a selection to be held by the `sp-menu` that it presents in
 *   its overlay, use `selects="single" to activate this functionality.
 */
export class ActionMenu extends ObserveSlotText(PickerBase, 'label') {
    public static get styles(): CSSResultArray {
        return [actionMenuStyles];
    }

    public static elementDefinitions = {
        ...PickerBase.elementDefinitions,
        'sp-menu': Menu,
        'sp-popover': Popover,
        'sp-action-button': ActionButton,
        'sp-icon-more': IconMore,
    };

    @property({ type: String })
    public selects: undefined | 'single' = undefined;

    protected listRole: 'listbox' | 'menu' = 'menu';
    protected itemRole = 'menuitem';
    private get hasLabel(): boolean {
        return this.slotHasContent;
    }

    protected get buttonContent(): TemplateResult[] {
        return [
            html`
                <slot name="icon" slot="icon" ?icon-only=${!this.hasLabel}>
                    <sp-icon-more class="icon"></sp-icon-more>
                </slot>
                <slot name="label" ?hidden=${!this.hasLabel}></slot>
            `,
        ];
    }

    protected get renderButton(): TemplateResult {
        return html`
            <sp-action-button
                quiet
                ?selected=${this.open}
                aria-haspopup="true"
                aria-controls="popover"
                aria-expanded=${this.open ? 'true' : 'false'}
                aria-label=${ifDefined(this.label || undefined)}
                id="button"
                class="button"
                size=${this.size}
                @blur=${this.onButtonBlur}
                @click=${this.onButtonClick}
                @focus=${this.onButtonFocus}
                ?disabled=${this.disabled}
            >
                ${this.buttonContent}
            </sp-action-button>
        `;
    }

    protected get renderPopover(): TemplateResult {
        return html`
            <sp-popover id="popover" @sp-overlay-closed=${this.onOverlayClosed}>
                <sp-menu
                    id="menu"
                    role="${this.listRole}"
                    @change=${this.handleChange}
                    .selects=${this.selects}
                ></sp-menu>
            </sp-popover>
        `;
    }

    protected updated(changedProperties: PropertyValues): void {
        super.updated(changedProperties);
        if (changedProperties.has('invalid')) {
            this.invalid = false;
        }
        this.quiet = true;
    }
}
