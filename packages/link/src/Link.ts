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
    query,
    SizedMixin,
} from '@spectrum-web-components/base';
import { LikeAnchor } from '@spectrum-web-components/shared/src/like-anchor.js';
import { Focusable } from '@spectrum-web-components/shared/src/focusable.js';

import linkStyles from './link.css.js';

/**
 * @element sp-link
 *
 * @attr quiet - uses quiet styles or not
 * @attr over-background - uses over background styles or not
 */
export class Link extends SizedMixin(LikeAnchor(Focusable), {
    noDefaultSize: true,
}) {
    public static get styles(): CSSResultArray {
        return [linkStyles];
    }

    @query('#anchor')
    anchorElement!: HTMLAnchorElement;

    public get focusElement(): HTMLElement {
        return this.anchorElement;
    }

    protected render(): TemplateResult {
        return this.renderAnchor({ id: 'anchor' });
    }
}
