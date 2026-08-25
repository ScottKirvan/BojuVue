# HelloWorld

A title rendered above a bordered box containing an icon and text. Originally built as
an exercise to verify the export-and-preview loop end to end — kept as the simplest
possible reference for what a BojuVue component looks like.

## Demo

<HelloWorld />

<HelloWorld title="Custom Title" text="With different text passed in as props." />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | `'Test Title'` | Heading rendered above the box. |
| `text` | `string` | `'Hello from BojuVue'` | Text rendered inside the box, next to the icon. |

## Usage

```vue
<script setup>
import { HelloWorld } from '@scottkirvan/bojuvue'
</script>

<template>
  <HelloWorld title="Hello, other site!" text="Same component, different content." />
</template>
```
