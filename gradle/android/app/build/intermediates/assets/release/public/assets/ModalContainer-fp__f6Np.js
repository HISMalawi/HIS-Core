import{d as m,bc as p,av as c,aU as _,K as i,a8 as u,_ as f,r as v,o as l,c as d,w as M,aV as C}from"./index-ru8RXlaa.js";const D=m({components:{IonModal:p,ZebraModal:c(()=>_(()=>import("./ZebraPrinterImage-N29up_k8.js"),__vite__mapDeps([0,1,2,3])))},emits:["modalDismissed"],props:{modalName:{type:String}},setup(e,{emit:n}){const o=i(!1),s=i("");function t(){o.value=!1,n("modalDismissed")}return u(e,({modalName:a})=>{a?(s.value=a,o.value=!0):o.value=!1},{deep:!0}),{dismissModal:t,modalIsOpen:o,activeModal:s}}});function O(e,n,o,s,t,a){const r=v("ion-modal");return l(),d(r,{"is-open":e.modalIsOpen},{default:M(()=>[(l(),d(C(e.activeModal),{onOnDismissModal:e.dismissModal},null,40,["onOnDismissModal"]))]),_:1},8,["is-open"])}const $=f(D,[["render",O]]);export{$ as default};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = ["assets/ZebraPrinterImage-N29up_k8.js","assets/index-ru8RXlaa.js","assets/index-9zFinVYg.css","assets/ZebraPrinterImage-TRM6RQ9U.css"]
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
