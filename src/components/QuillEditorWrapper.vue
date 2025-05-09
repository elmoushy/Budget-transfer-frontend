<template>
  <div class="quill-editor-wrapper" ref="editorContainer">
    <QuillEditor
      v-model:content="internalContent"
      :toolbar="toolbar"
      :contentType="contentType"
      :theme="theme"
      :options="options"
      :class="editorClass"
      @update:content="$emit('update:content', $event)"
      @textChange="$emit('textChange', $event)"
      @selectionChange="$emit('selectionChange', $event)"
      @editorChange="$emit('editorChange', $event)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
      @ready="onEditorReady"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, defineProps, defineEmits } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import { patchQuillDOMEvents } from '@/utils/domObserver'

// Define props to pass through to QuillEditor
const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  toolbar: {
    type: [Array, Object],
    default: () => [],
  },
  contentType: {
    type: String,
    default: 'html',
  },
  theme: {
    type: String,
    default: 'snow',
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  class: {
    type: [String, Array, Object],
    default: '',
  },
})

// Define emits to forward from QuillEditor
const emit = defineEmits([
  'update:content',
  'textChange',
  'selectionChange',
  'editorChange',
  'focus',
  'blur',
  'ready',
])

// Refs
const editorContainer = ref(null)
const internalContent = ref(props.content)

// Classes
const editorClass = computed(() => props.class)

// Watch for content changes from parent
watch(
  () => props.content,
  (newContent) => {
    internalContent.value = newContent
  },
)

// When the editor is ready, apply our patch
const onEditorReady = (quill) => {
  // Apply the patch to prevent DOMNodeInserted warnings
  // Small timeout to ensure the DOM is fully rendered
  setTimeout(() => {
    patchQuillDOMEvents(editorContainer.value)
  }, 0)

  // Forward the ready event
  emit('ready', quill)
}

// Apply the patch on mount too
onMounted(() => {
  setTimeout(() => {
    patchQuillDOMEvents(editorContainer.value)
  }, 0)
})
</script>
