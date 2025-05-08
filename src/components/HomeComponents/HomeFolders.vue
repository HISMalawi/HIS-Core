<template>
    <ion-breadcrumbs>
        <ion-breadcrumb 
            @click="changeBreadcrumb(index)"
            v-for="(link,index) in breadcrumb" 
            :key="index" 
            class="his-md-text">
            {{link}}
        </ion-breadcrumb>
    </ion-breadcrumbs>
    <ion-grid>
        <ion-row>
            <ion-col 
                v-for="(item, index) in displayList" 
                :key="index"
                size-lg="4"
                size-sm="12"
                >
                <task-card @click="item.action" :title="item.name" :icon="img(item.icon)"/>
            </ion-col>
        </ion-row>
    </ion-grid>
</template>
<script setup lang="ts">
import { PropType, onMounted, ref, watch } from "vue"
import { FolderInterface } from "@/apps/interfaces/AppInterface"
import TaskCard from "@/components/DataViews/TaskCard.vue";
import {
    IonGrid,
    IonRow,
    IonBreadcrumbs,
    IonBreadcrumb,
    IonCol
} from "@ionic/vue";
import img from '@/utils/Img'
import router from "@/router";
import Store from "@/composables/ApiStore"
import { isEmpty } from "lodash";

const emit = defineEmits(['onSublist'])

const props = defineProps({ 
    items: Object as PropType<FolderInterface[]>,
    resetList: Number
})

const breadcrumb = ref<string[]>()
const folderTree = ref<any>({})
const displayList = ref<any>([])

/**
 * Build a special object structure to easily navigate folders and bake breadcrumbs
 * @param items 
 * @param pathHistory 
 * @param parentIcon 
 * @param tree 
 */
function createFolderTree(items: FolderInterface[], pathHistory:String[]=[], parentIcon="", tree: any={}) {
    return items.reduce((all: any, item: FolderInterface) => {
        if (item.files && !isEmpty(item.files)) {
            const data = {...tree[item.name]??{}}
            const pathData = [...pathHistory, item.name]
            if (!all[item.name]) all[item.name] = { _breadcrumb: [], ...item}
            all[item.name] = createFolderTree(item.files, pathData, item.defaultFilesIcon ?? item.icon, data)
            all[item.name]._breadcrumb = pathData
            all[item.name]._visible = item.condition ? item.condition() : true
            all[item.name]._icon = item.icon ?? parentIcon
        } else {
            all[item.name] = item
            all[item.name].icon = item.icon ?? parentIcon
            all[item.name]._visible = item.condition ? item.condition() : true
        }
        return all
    }, {...tree})
}

/**
 * Change folders by folder path represented as an array of strings
 * @param path 
 */
async function navigate(path: string[]) {
    breadcrumb.value = path
    Store.set('ACTIVE_HOME_SUB_TAB_NAME', breadcrumb.value)
    const rootData = retrievePath(path,0, folderTree.value)
    await buildDisplayList(rootData)
    emit("onSublist")
}

/**
 * Push display data
 * @param treeData 
 */
async function buildDisplayList(treeData: Record<string, any>) {
    displayList.value = []
    for (const index in treeData) {
        const component: any = treeData[index]
        if (!(await component._visible)) continue
        displayList.value.push({
            name: index,
            icon: component._icon ?? component.icon,
            action: () => {
                if (typeof component.action === 'function') {
                    component.action()
                } else if (component._breadcrumb) {
                    navigate(component._breadcrumb)
                } else if (component.pathUrl) {
                    router.push(component.pathUrl)
                } else if (component.pathName) {
                    router.push({ name: component.pathName})
                } 
            }
        })
    }
}

function changeBreadcrumb(index: number) {
    const path = (breadcrumb.value??[]).filter((_: any, i: number) => i <= index)
    navigate(path)
}

function retrievePath(path: String[], pathIndex=0, data:any={}) {
    if (path[0] === "") return data
    const indexName: any = path[pathIndex]
    const nextIndex: any = pathIndex +1
    let pathData: any = data[indexName]
    if (nextIndex < path.length) {
        pathData = retrievePath(path, nextIndex, pathData)
    }
    return pathData
}

watch(() => props.resetList, () => navigate([""]))

onMounted(async () => {
    folderTree.value = createFolderTree(props.items??[])
    navigate((await Store.get('ACTIVE_HOME_SUB_TAB_NAME'))??[""])
})
</script>
