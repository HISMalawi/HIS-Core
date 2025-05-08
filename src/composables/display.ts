import { onMounted, onUnmounted, ref } from "vue"

export default function Display() {
    const resolution = ref({
        width: window.innerWidth,
        height: window.innerHeight
    })
    function onResize(event: any) {
        resolution.value = {
            height:  event.currentTarget.innerHeight,
            width: event.currentTarget.innerWidth 
        } 
    }
    onMounted(() => {
        addEventListener('resize', onResize)
    })
    onUnmounted(() => {
        removeEventListener('resize', onResize)
    })
    return {
        resolution
    }
}