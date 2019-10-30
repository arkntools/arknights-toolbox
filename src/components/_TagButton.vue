<template>
    <label :class="'mdui-btn mdui-btn-dense mdui-ripple tag-btn '+(checked?selectedColor:notSelectedColor)">
        <input type="checkbox" :checked="checked" @change="() => { onlyClick ? false : $emit('change', $event.target.checked) }" style="display:none" />
        <slot></slot>
    </label>
</template>

<script>
export default {
    name: 'tag-button',
    model: {
        prop: 'checked',
        event: 'change',
    },
    props: {
        checked: Boolean,
        selectedColor: String,
        notSelectedColor: String,
        onlyClick: {
            type: Boolean,
            default: false,
        },
    },
};
</script>
