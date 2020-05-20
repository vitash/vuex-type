// import Vue from "vue"
// import Vuex, { Store, ModuleTree } from "vuex"
// import { useSStore, rootGetters, Getters, storeModule, State, rootModules, } from "./index"


// declare module './index' {
//     interface SStore<T> extends Store<T> {
//         getters: ExtractGetters<typeof getters>
//     }
//     interface StoreModules {
//         ss: ReturnType<typeof ss>
//         dd: ReturnType<typeof dd>
//     }
// }

// // in other files
// const ss = storeModule("ss", {
//     namespaced: true,
//     state: {
//         id: 0,
//         name: "",
//         flag: "A" as "A" | "B" | "C",
//         nums: [] as number[],
//     },
//     mutations: {
//         setName(state, data: { name: string, id: number }) {
//             state.id = 2
//             state.name = data.name
//         },
//         setNums(state, data: number[]) {
//             state.nums = data
//         }
//     },
//     actions: {
//         async setName(ctx, data: { name: string, id: number }) {
//             ctx.commit("setName", data)
//         },
//         async setNums({ commit, dispatch, state, rootGetters }, nums: number[]) {
//             commit("setNums", nums)
//             return { ao_li_gei: rootGetters.ao_li_gei, name: "ddd" }
//         }
//     }
// })

// // in other files
// const dd = storeModule("dd", {
//     namespaced: true,
//     state: {
//         count: 3
//     },
//     mutations: {
//         increment(state) {
//             state.count += 1
//         },
//         add(state, data: number) {
//             state.count += data
//         }
//     },
//     actions: {
//         async add({ commit }, nums: Promise<number[]>) {
//             let total = (await nums).reduce((acc, n) => acc += n)
//             commit("add", total)
//             // commit("ss/setName", { name: "ss", id: 0 }) // error, commit 到其他模块，目前无法推导
//             commit("ss/setName" as any, { name: "ss", id: 0 }) // any 
//         }
//     }
// })

// // in other files
// const getters = rootGetters({
//     ao_li_gei(state, g) {
//         return state.dd.count
//     },
//     name({ ss, dd }, g) {
//         return g.ao_li_gei + ss.name + dd.count
//     },
// })

// const modules = rootModules({}, ss, dd)

// export const store = new Vuex.Store({
//     getters,
//     modules,
//     plugins: [useSStore]
// })

// // vue components
// class VueTest extends Vue {
//     get s1() {
//         return this.$$store.state.ss.nums
//     }
//     fn1() {
//         this.$$store.commit(["ss", "setName"])({ name: "dd", id: 3 })

//         this.$$store.commit(["dd", "increment"])()
//         this.$$store.getters.ao_li_gei
//     }
// }

