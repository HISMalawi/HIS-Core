System.register(["./index-legacy-Ezw3ESUe.js"],(function(e,t){"use strict";var n,r,s,o,i;return{setters:[e=>{n=e.bO,r=e.bP,s=e.bQ,o=e.bR,i=e.bS}],execute:function(){
/*!
             * (C) Ionic http://ionicframework.com - MIT License
             */
e("startStatusTap",(()=>{const e=window;e.addEventListener("statusTap",(()=>{n((()=>{const t=e.innerWidth,n=e.innerHeight,a=document.elementFromPoint(t/2,n/2);if(!a)return;const c=r(a);c&&new Promise((e=>s(c,e))).then((()=>{o((async()=>{c.style.setProperty("--overflow","hidden"),await i(c,300),c.style.removeProperty("--overflow")}))}))}))}))}))}}}));
