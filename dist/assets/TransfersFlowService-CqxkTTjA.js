import{c as p,a as s,x as c}from"./index-DKsQNwYd.js";/**
 * @license lucide-vue-next v0.503.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=p("search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]),i="http://lightidea.org:9000/",u={async fetchPendingTransfers(e=1,a=10,t="",o=""){const r=s();if(!r.token)throw new Error("Authentication token not found");try{return(await c.get(`${i}/api/budget/transfers/list_underapprovel/`,{headers:{Authorization:`Bearer ${r.token}`},params:{page:e,page_size:a,code:o,search:t.trim()}})).data}catch(n){throw console.error("Error fetching transfers pending approval:",n),n}},async approveRejectTransfers(e,a,t=[]){const o=s();if(!o.token)throw new Error("Authentication token not found");try{return(await c.post(`${i}/api/budget/transfers/adjd-approve-reject/`,{transaction_id:e,decide:e.map(()=>a),reason:t.length?t:e.map(()=>"")},{headers:{Authorization:`Bearer ${o.token}`}})).data}catch(r){throw console.error("Error approving/rejecting transfers:",r),r}}};export{d as S,u as T};
