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
    CSSResultArray,
    TemplateResult,
    property,
    query,
    PropertyValues,
} from '@spectrum-web-components/base';
import { streamingListener } from '@spectrum-web-components/base/src/streaming-listener.js';
import { Focusable } from '@spectrum-web-components/shared/src/focusable.js';
import '@spectrum-web-components/color-handle/sp-color-handle.js';
import styles from './color-slider.css.js';
import {
    ColorHandle,
    ColorValue,
    extractHueAndSaturationRegExp,
    replaceHueAndSaturationRegExp,
} from '@spectrum-web-components/color-handle';
import { TinyColor } from '@ctrl/tinycolor';

/**
 * @element sp-color-slider
 * @slot gradient - a custom gradient visually outlining the available color values
 */
export class ColorSlider extends Focusable {
    public static get styles(): CSSResultArray {
        return [styles];
    }

    @property({ type: Boolean, reflect: true })
    public disabled = false;

    @property({ type: Boolean, reflect: true })
    public focused = false;

    @query('.handle')
    private handle!: ColorHandle;

    @property({ type: String })
    public label = 'hue';

    @property({ type: Boolean, reflect: true })
    public vertical = false;

    @property({ type: Number })
    public get value(): number {
        return this._value;
    }

    public set value(hue: number) {
        const value = Math.min(360, Math.max(0, hue));
        if (value === this.value) {
            return;
        }
        const oldValue = this.value;
        const { s, v } = this._color.toHsv();
        this._color = new TinyColor({ h: value, s, v });
        this._value = value;

        if (value !== this.sliderHandlePosition) {
            this.sliderHandlePosition = 100 * (value / 360);
        }

        this.requestUpdate('value', oldValue);
    }

    private _value = 0;

    @property({ type: Number, reflect: true })
    public sliderHandlePosition = 0;

    @property({ type: String })
    public get color(): ColorValue {
        switch (this._format.format) {
            case 'rgb':
                return this._format.isString
                    ? this._color.toRgbString()
                    : this._color.toRgb();
            case 'prgb':
                return this._format.isString
                    ? this._color.toPercentageRgbString()
                    : this._color.toPercentageRgb();
            case 'hex':
            case 'hex3':
            case 'hex4':
            case 'hex6':
                return this._format.isString
                    ? this._color.toHexString()
                    : this._color.toHex();
            case 'hex8':
                return this._format.isString
                    ? this._color.toHex8String()
                    : this._color.toHex8();
            case 'name':
                return this._color.toName() || this._color.toRgbString();
            case 'hsl':
                if (this._format.isString) {
                    const hslString = this._color.toHslString();
                    return hslString.replace(
                        replaceHueAndSaturationRegExp,
                        `$1${this.value}$2${this._saturation}`
                    );
                } else {
                    const { s, l, a } = this._color.toHsl();
                    return { h: this.value, s, l, a };
                }
            case 'hsv':
                if (this._format.isString) {
                    const hsvString = this._color.toHsvString();
                    return hsvString.replace(
                        replaceHueAndSaturationRegExp,
                        `$1${this.value}$2${this._saturation}`
                    );
                } else {
                    const { s, v, a } = this._color.toHsv();
                    return { h: this.value, s, v, a };
                }
            default:
                return 'No color format applied.';
        }
    }

    public set color(color: ColorValue) {
        if (color === this.color) {
            return;
        }
        const oldValue = this._color;
        this._color = new TinyColor(color);
        const format = this._color.format;
        let isString = typeof color === 'string' || color instanceof String;

        if (format.startsWith('hex')) {
            isString = (color as string).startsWith('#');
        }

        this._format = {
            format,
            isString,
        };

        if (isString && format.startsWith('hs')) {
            const values = extractHueAndSaturationRegExp.exec(color as string);
            if (values !== null) {
                const [, h, s] = values;
                this.value = Number(h);
                this._saturation = Number(s);
            }
        } else if (!isString && format.startsWith('hs')) {
            const colorInput = this._color.originalInput;
            const colorValues = Object.values(colorInput);
            this.value = colorValues[0];
            this._saturation = colorValues[1];
        } else {
            const { h } = this._color.toHsv();
            this.value = h;
        }
        this._previousColor = oldValue;
        this.requestUpdate('color', oldValue);
    }

    private _color = new TinyColor({ h: 0, s: 1, v: 1 });

    private _previousColor = new TinyColor({ h: 0, s: 1, v: 1 });

    private _saturation!: number;

    private _format: { format: string; isString: boolean } = {
        format: '',
        isString: false,
    };

    @property({ type: Number })
    public step = 1;

    private get altered(): number {
        return this._altered;
    }

    private set altered(altered: number) {
        this._altered = altered;
        this.step = Math.max(1, this.altered * 10);
    }

    private _altered = 0;

    private altKeys = new Set();

    @query('input')
    public input!: HTMLInputElement;

    public get focusElement(): HTMLInputElement {
        return this.input;
    }

    private handleKeydown(event: KeyboardEvent): void {
        const { key } = event;
        if (['Shift', 'Meta', 'Control', 'Alt'].includes(key)) {
            this.altKeys.add(key);
            this.altered = this.altKeys.size;
        }
        let delta = 0;
        switch (key) {
            case 'ArrowUp':
                delta = this.step;
                break;
            case 'ArrowDown':
                delta = -this.step;
                break;
            case 'ArrowLeft':
                delta = this.step * (this.isLTR ? -1 : 1);
                break;
            case 'ArrowRight':
                delta = this.step * (this.isLTR ? 1 : -1);
                break;
            default:
                return;
        }
        event.preventDefault();

        this.sliderHandlePosition = Math.min(
            100,
            Math.max(0, this.sliderHandlePosition + delta)
        );
        this.value = 360 * (this.sliderHandlePosition / 100);
        this._color = new TinyColor({ ...this._color.toHsl(), h: this.value });

        if (delta != 0) {
            this.dispatchEvent(
                new Event('input', {
                    bubbles: true,
                    composed: true,
                })
            );
            this.dispatchEvent(
                new Event('change', {
                    bubbles: true,
                    composed: true,
                })
            );
        }
    }

    private handleKeyup(event: KeyboardEvent): void {
        event.preventDefault();
        const { key } = event;
        if (['Shift', 'Meta', 'Control', 'Alt'].includes(key)) {
            this.altKeys.delete(key);
            this.altered = this.altKeys.size;
        }
    }

    private handleInput(event: Event & { target: HTMLInputElement }): void {
        const { valueAsNumber } = event.target;

        this.value = valueAsNumber;
        this.sliderHandlePosition = 100 * (this.value / 360);
        this._color = new TinyColor({ ...this._color.toHsl(), h: this.value });
    }

    private handleChange(): void {
        this.dispatchEvent(
            new Event('change', {
                bubbles: true,
                composed: true,
            })
        );
    }

    private handleFocusin(): void {
        this.focused = true;
    }

    private handleFocusout(): void {
        this.focused = false;
    }

    private boundingClientRect!: DOMRect;

    private handlePointerdown(event: PointerEvent): void {
        if (event.button !== 0) {
            event.preventDefault();
            return;
        }
        this._previousColor = this._color.clone();
        this.boundingClientRect = this.getBoundingClientRect();
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        if (event.pointerType === 'mouse') {
            this.handleFocusin();
        }
    }

    private handlePointermove(event: PointerEvent): void {
        this.sliderHandlePosition = this.calculateHandlePosition(event);
        this.value = 360 * (this.sliderHandlePosition / 100);

        this._color = new TinyColor({ ...this._color.toHsl(), h: this.value });

        this.dispatchEvent(
            new Event('input', {
                bubbles: true,
                composed: true,
                cancelable: true,
            })
        );
    }

    private handlePointerup(event: PointerEvent): void {
        // Retain focus on input element after mouse up to enable keyboard interactions
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);

        const applyDefault = this.dispatchEvent(
            new Event('change', {
                bubbles: true,
                composed: true,
                cancelable: true,
            })
        );
        if (!applyDefault) {
            this._color = this._previousColor;
        }
        this.focus();
        if (event.pointerType === 'mouse') {
            this.handleFocusout();
        }
    }

    /**
     * Returns the value under the cursor
     * @param: PointerEvent on slider
     * @return: Slider value that correlates to the position under the pointer
     */
    private calculateHandlePosition(event: PointerEvent): number {
        /* c8 ignore next 3 */
        if (!this.boundingClientRect) {
            return this.sliderHandlePosition;
        }
        const rect = this.boundingClientRect;
        const minOffset = this.vertical ? rect.top : rect.left;
        const offset = this.vertical ? event.clientY : event.clientX;
        const size = this.vertical ? rect.height : rect.width;

        const percent = Math.max(0, Math.min(1, (offset - minOffset) / size));
        const sliderHandlePosition = 100 * percent;

        return sliderHandlePosition;
    }

    private handleGradientPointerdown(event: PointerEvent): void {
        if (event.button !== 0) {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        this.handle.dispatchEvent(new PointerEvent('pointerdown', event));
        this.handlePointermove(event);
    }

    protected render(): TemplateResult {
        return html`
            <div
                class="checkerboard"
                role="presentation"
                @pointerdown=${this.handleGradientPointerdown}
            >
                <div
                    class="gradient"
                    role="presentation"
                    style="background: linear-gradient(to ${this.vertical
                        ? 'bottom'
                        : 'right'}, var(--sp-color-slider-gradient, var(--sp-color-slider-gradient-fallback)));"
                >
                    <slot name="gradient"></slot>
                </div>
            </div>
            <sp-color-handle
                tabindex="-1"
                class="handle"
                color="hsl(${this.value}, 100%, 50%)"
                ?disabled=${this.disabled}
                style="${this.vertical ? 'top' : 'left'}: ${this
                    .sliderHandlePosition}%"
                @manage=${streamingListener(
                    { type: 'pointerdown', fn: this.handlePointerdown },
                    { type: 'pointermove', fn: this.handlePointermove },
                    {
                        type: ['pointerup', 'pointercancel'],
                        fn: this.handlePointerup,
                    }
                )}
            ></sp-color-handle>
            <input
                type="range"
                class="slider"
                min="0"
                max="360"
                step=${this.step}
                aria-label=${this.label}
                .value=${String(this.value)}
                @input=${this.handleInput}
                @change=${this.handleChange}
                @keydown=${this.handleKeydown}
                @keyup=${this.handleKeyup}
            />
        `;
    }

    protected firstUpdated(changed: PropertyValues): void {
        super.firstUpdated(changed);
        this.boundingClientRect = this.getBoundingClientRect();
        this.addEventListener('focusin', this.handleFocusin);
        this.addEventListener('focusout', this.handleFocusout);
    }
}
