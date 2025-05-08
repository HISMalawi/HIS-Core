<template>
  <div class="card his-card">
    <div class="his-md-text header-section">
      {{ title }} 
    </div>
    
    <button 
      class="nav-btn nav-btn-top clickable" 
      :disabled="!showPrevButton" 
      @click="goPrev">
      <img :src="upbuttonImg" :width="btnSize"/>
    </button>
    <div :class="listAlignmentClass">
      <ion-list> 
        <ion-item
          class="his-md-text"
          v-for="(item, index) in activeListItems" :key="index"
          @click="onselect(item)"
          :detail="true"
          :color="isActive(item) ? 'primary' : ''"
        > 
          {{ item.label }}
        </ion-item>
      </ion-list>
    </div>
    <div class="bottom-section">
      <button 
          class="nav-btn nav-btn-bottom clickable" 
          :disabled="!showNextButton" 
          @click="goNext">
          <img :src="downbuttonImg" :width="btnSize"/>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Option } from "@/components/Forms/FieldInterface";
import { chunk, findIndex, isEmpty } from "lodash"
import {
  IonList,
  IonItem
} from "@ionic/vue"
export default defineComponent({
  components: {
    IonList,
    IonItem
  },
  props: {
    title: {
      type: String,
      default: () => "Visits",
    },
    items: {
      type: Object as PropType<Option[]>,
      required: true,
    },
  },
  data: () => ({
    active: {} as Option,
    activeListItems: [] as any,
    paginatedListItems: [] as any,
    index: -1,
    perPage: 6,
    btnSize: 45
  }),
  computed: {
    listAlignmentClass(): string {
      return this.activeListItems && this.activeListItems.length === this.perPage ? 'vertically-align' : ''
    },
    upbuttonImg(): string {
      return '/assets/images/drop-up-arrow.svg'
    },
    downbuttonImg(): string {
      return '/assets/images/drop-down-arrow.svg'
    },
    showNextButton(): boolean {
      return this.index +1 < this.paginatedListItems.length
    },
    showPrevButton(): boolean {
      return this.index >= 1
    }
  },
  watch: {
    items: {
      handler(items: Array<Option> | undefined) {
        if (isEmpty(items)) {
          return
        }
        this.index = 0
        this.paginatedListItems = chunk(items, this.perPage)
        this.activeListItems = this.paginatedListItems[0]
        this.active = this.activeListItems[0]
        // Seek a date tagged as active and set it as active
        for(const index in this.paginatedListItems) {
          const indexOfActiveDate = findIndex(this.paginatedListItems[index], (e: Option) => {
            return e.other.isActive === true
          }, 0)
          if (indexOfActiveDate != -1) {
            this.index = parseInt(index)
            this.activeListItems = this.paginatedListItems[index]
            this.active = this.activeListItems[indexOfActiveDate]
            break
          }
        }
      },
      deep: true,
      immediate: true,
    },
    index : {
      handler(num: number){
        this.activeListItems = this.paginatedListItems[num]
      },
      immediate: true
    },   
    active(item: Option) {
      this.$emit("onselect", item);
    },
  },
  methods: {
    onselect(item: Option) {
      this.active = item;
    },
    isActive(item: Option) {
      return item.label === this.active.label;
    },
    goNext() {
      const nextIndex = this.index + 1
      if (nextIndex <= this.paginatedListItems.length) {
        this.index = nextIndex
      }
    },
    goPrev() {
      if (this.paginatedListItems.length >= 1) {
        this.index -= 1
      }
    }
  },
});
</script>
<style scoped>
button:disabled,
button[disabled]{
  cursor: not-allowed;
  filter: alpha(opacity=62);
  -webkit-box-shadow: none;
  box-shadow: none;
  opacity: .62;
}

.body-section {
  position: absolute;
}
.card {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.nav-btn {
  width: 90%;
  margin-left: 5%;
  height: 50px;
  background-color: white;
}
.nav-btn-top {
  border-bottom: solid 2px #ccc;
}
.nav-btn-bottom {
  border-top: solid 2px #ccc;
}
.header-section {
  text-align: center;
  font-weight: bold;
  margin: 10%;
}
.bottom-section {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 15px;
}
</style>
