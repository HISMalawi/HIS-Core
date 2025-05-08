<template>
  <div class="pagination">
    <div class="btn-group">
      <ion-button color="light" @click="setFirstPage" :disabled="isInFirstPage">
        First
      </ion-button>
      <ion-button color="light" @click="prevPage">
        <ion-icon :icon="caretBack"></ion-icon>
      </ion-button>
      <ion-button
        v-for="page in pages"
        @click="page.show()"
        :color="page.isActive ? 'primary' : 'light'"
        :key="page.index"
        >
        {{ page.name }}
      </ion-button>
      <ion-button color="light" @click="nextPage">
        <ion-icon :icon="caretForward"></ion-icon>
      </ion-button>
      <ion-button color="light" @click="setLastPage" :disabled="isInLastPage">
        Last
      </ion-button>
    </div>
    <h6>Page {{ currentPage + 1 }} of {{ totalPages }}</h6>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { caretBack, caretForward } from "ionicons/icons";
import { IonIcon, IonButton } from "@ionic/vue"

export default defineComponent({
   components: { 
    IonIcon,
    IonButton,
   },
   props: {
    maxVisibleButtons: {
      type: Number,
      required: false,
      default: 3
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  emits: ['onChangePage'],
  setup(props, { emit }) {
    const currentPage = ref(0)
    const isInFirstPage = computed(() => currentPage.value === 0)
    const isInLastPage = computed(() => currentPage.value === props.totalPages)
    const startPage = computed(() => {
      if(currentPage.value === 0) return 0
      if(currentPage.value === props.totalPages) return props.totalPages - props.maxVisibleButtons
      return currentPage.value - 1
    })

    const setPage = (page: number) => emit('onChangePage', page)

    const pages = computed(() => {
      const range = []
      for (
        let i = startPage.value;
        i <= Math.min(startPage.value + props.maxVisibleButtons - 1, props.totalPages - 1);
        i++
      ) {
        range.push({
          index: i,
          name: i + 1,
          show: () => currentPage.value = i,
          isActive: i === currentPage.value
        })
      }
      return range
    })

    watch(props, ({totalPages}) => { 
      if (typeof totalPages === 'number') currentPage.value = 0
    }, 
    { 
      immediate: true,
      deep: true
    }) 

    watch(currentPage, (page) => setPage(page))

    const setFirstPage = () => currentPage.value = 0
    const setLastPage = () => currentPage.value = props.totalPages - 1
    const prevPage = () => { if(currentPage.value > 0) currentPage.value -= 1 }
    const nextPage = () => { if((currentPage.value + 1) < props.totalPages) currentPage.value += 1 }

    return {
      currentPage,
      caretBack,
      caretForward,
      startPage,
      pages,
      isInFirstPage,
      isInLastPage,
      nextPage,
      prevPage,
      setPage,
      setFirstPage,
      setLastPage,
    }
  },
})
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  justify-items: center;
}
.pagination .btn-group {
  margin: .5rem;
  display: flex;
  justify-content: flex-start;
}

.pagination ion-button {
  margin: .1rem;
}
h6 {
  margin-right: .5rem;
}
</style>
