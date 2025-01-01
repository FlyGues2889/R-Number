import { __decorate } from "tslib";
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { MduiElement } from '@mdui/shared/base/mdui-element.js';
import { FormController, formResets } from '@mdui/shared/controllers/form.js';
import { HasSlotController } from '@mdui/shared/controllers/has-slot.js';
import { defaultValue } from '@mdui/shared/decorators/default-value.js';
import { watch } from '@mdui/shared/decorators/watch.js';
import { booleanConverter } from '@mdui/shared/helpers/decorator.js';
import { nothingTemplate } from '@mdui/shared/helpers/template.js';
import '@mdui/shared/icons/check.js';
import { componentStyle } from '@mdui/shared/lit-styles/component-style.js';
import { FocusableMixin } from '@mdui/shared/mixins/focusable.js';
import '../icon.js';
import { RippleMixin } from '../ripple/ripple-mixin.js';
import { style } from './style.js';
/**
 * @summary 开关切换组件
 *
 * ```html
 * <mdui-switch></mdui-switch>
 * ```
 *
 * @event focus - 获得焦点时触发
 * @event blur - 失去焦点时触发
 * @event change - 选中状态变更时触发
 * @event input - 选中状态变更时触发
 * @event invalid - 表单字段验证不通过时触发
 *
 * @slot unchecked-icon - 未选中状态的元素
 * @slot checked-icon - 选中状态的元素
 *
 * @csspart track - 轨道
 * @csspart thumb - 图标容器
 * @csspart unchecked-icon - 未选中状态的图标
 * @csspart checked-icon 选中状态的图标
 *
 * @cssprop --shape-corner - 组件轨道的圆角大小。可以指定一个具体的像素值；但更推荐引用[设计令牌](/docs/2/styles/design-tokens#shape-corner)
 * @cssprop --shape-corner-thumb - 组件图标容器的圆角大小。可以指定一个具体的像素值；但更推荐引用[设计令牌](/docs/2/styles/design-tokens#shape-corner)
 */
let Switch = class Switch extends RippleMixin(FocusableMixin(MduiElement)) {
    constructor() {
        super(...arguments);
        /**
         * 是否为禁用状态
         */
        this.disabled = false;
        /**
         * 是否为选中状态
         */
        this.checked = false;
        /**
         * 默认选中状态。在重置表单时，将重置为此状态。此属性只能通过 JavaScript 属性设置
         */
        this.defaultChecked = false;
        /**
         * 提交表单时，是否必须选中此开关
         */
        this.required = false;
        /**
         * 开关的名称，将与表单数据一起提交
         */
        this.name = '';
        /**
         * 开关的值，将于表单数据一起提交
         */
        this.value = 'on';
        /**
         * 是否验证未通过
         */
        this.invalid = false;
        this.rippleRef = createRef();
        this.inputRef = createRef();
        this.formController = new FormController(this, {
            value: (control) => (control.checked ? control.value : undefined),
            defaultValue: (control) => control.defaultChecked,
            setValue: (control, checked) => (control.checked = checked),
        });
        this.hasSlotController = new HasSlotController(this, 'unchecked-icon');
    }
    /**
     * 表单验证状态对象，具体参见 [`ValidityState`](https://developer.mozilla.org/zh-CN/docs/Web/API/ValidityState)
     */
    get validity() {
        return this.inputRef.value.validity;
    }
    /**
     * 如果表单验证未通过，此属性将包含提示信息。如果验证通过，此属性将为空字符串
     */
    get validationMessage() {
        return this.inputRef.value.validationMessage;
    }
    get rippleElement() {
        return this.rippleRef.value;
    }
    get rippleDisabled() {
        return this.disabled;
    }
    get focusElement() {
        return this.inputRef.value;
    }
    get focusDisabled() {
        return this.disabled;
    }
    async onDisabledChange() {
        await this.updateComplete;
        this.invalid = !this.inputRef.value.checkValidity();
    }
    async onCheckedChange() {
        await this.updateComplete;
        // reset 引起的值变更，不执行验证；直接修改值引起的变更，需要进行验证
        const form = this.formController.getForm();
        if (form && formResets.get(form)?.has(this)) {
            this.invalid = false;
            formResets.get(form).delete(this);
        }
        else {
            this.invalid = !this.inputRef.value.checkValidity();
        }
    }
    /**
     * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`
     */
    checkValidity() {
        const valid = this.inputRef.value.checkValidity();
        if (!valid) {
            this.emit('invalid', {
                bubbles: false,
                cancelable: true,
                composed: false,
            });
        }
        return valid;
    }
    /**
     * 检查表单字段是否通过验证。如果未通过，返回 `false` 并触发 `invalid` 事件；如果通过，返回 `true`。
     *
     * 如果验证未通过，还会在组件上显示验证失败的提示。
     */
    reportValidity() {
        this.invalid = !this.inputRef.value.reportValidity();
        if (this.invalid) {
            const eventProceeded = this.emit('invalid', {
                bubbles: false,
                cancelable: true,
                composed: false,
            });
            // 调用了 preventDefault() 时，隐藏默认的表单错误提示
            if (!eventProceeded) {
                this.blur();
                this.focus();
            }
        }
        return !this.invalid;
    }
    /**
     * 设置自定义的错误提示文本。只要这个文本不为空，就表示字段未通过验证
     *
     * @param message 自定义的错误提示文本
     */
    setCustomValidity(message) {
        this.inputRef.value.setCustomValidity(message);
        this.invalid = !this.inputRef.value.checkValidity();
    }
    render() {
        return html `<label class="${classMap({
            invalid: this.invalid,
            'has-unchecked-icon': this.uncheckedIcon || this.hasSlotController.test('unchecked-icon'),
        })}"><input ${ref(this.inputRef)} type="checkbox" name="${ifDefined(this.name)}" value="${ifDefined(this.value)}" .disabled="${this.disabled}" .checked="${live(this.checked)}" .required="${this.required}" @change="${this.onChange}"><div part="track" class="track"><div part="thumb" class="thumb"><mdui-ripple ${ref(this.rippleRef)} .noRipple="${this.noRipple}"></mdui-ripple><slot name="checked-icon" part="checked-icon" class="checked-icon">${this.checkedIcon
            ? html `<mdui-icon name="${this.checkedIcon}" class="i"></mdui-icon>`
            : this.checkedIcon === ''
                ? nothingTemplate
                : html `<mdui-icon-check class="i"></mdui-icon-check>`}</slot><slot name="unchecked-icon" part="unchecked-icon" class="unchecked-icon">${this.uncheckedIcon
            ? html `<mdui-icon name="${this.uncheckedIcon}" class="i"></mdui-icon>`
            : nothingTemplate}</slot></div></div></label>`;
    }
    /**
     * input[type="checkbox"] 的 change 事件无法冒泡越过 shadow dom
     */
    onChange() {
        this.checked = this.inputRef.value.checked;
        this.emit('change');
    }
};
Switch.styles = [componentStyle, style];
__decorate([
    property({
        type: Boolean,
        reflect: true,
        converter: booleanConverter,
    })
], Switch.prototype, "disabled", void 0);
__decorate([
    property({
        type: Boolean,
        reflect: true,
        converter: booleanConverter,
    })
], Switch.prototype, "checked", void 0);
__decorate([
    defaultValue('checked')
], Switch.prototype, "defaultChecked", void 0);
__decorate([
    property({ reflect: true, attribute: 'unchecked-icon' })
], Switch.prototype, "uncheckedIcon", void 0);
__decorate([
    property({ reflect: true, attribute: 'checked-icon' })
], Switch.prototype, "checkedIcon", void 0);
__decorate([
    property({
        type: Boolean,
        reflect: true,
        converter: booleanConverter,
    })
], Switch.prototype, "required", void 0);
__decorate([
    property({ reflect: true })
], Switch.prototype, "form", void 0);
__decorate([
    property({ reflect: true })
], Switch.prototype, "name", void 0);
__decorate([
    property({ reflect: true })
], Switch.prototype, "value", void 0);
__decorate([
    state()
], Switch.prototype, "invalid", void 0);
__decorate([
    watch('disabled', true),
    watch('required', true)
], Switch.prototype, "onDisabledChange", null);
__decorate([
    watch('checked', true)
], Switch.prototype, "onCheckedChange", null);
Switch = __decorate([
    customElement('mdui-switch')
], Switch);
export { Switch };
