import Vue from "vue"
import Vuex, { Store, ModuleTree, GetterTree } from "vuex"
import { useSStore, storeModule, State, rootModules, GettersRecord, ExtractGetters, } from "./index"


declare module './index' {
    interface StoreModules {
        ss: ReturnType<typeof ss>
        dd: ReturnType<typeof dd>
        aa: ReturnType<typeof aa>
    }
}


// in other files
const ss = storeModule("ss", {
    namespaced: true,
    state: {
        id: 0,
        name: "",
        flag: "A" as "A" | "B" | "C",
        nums: [] as number[],
    },
    mutations: {
        setName(state, data: { name: string, id: number }) {
            state.id = 2
            state.name = data.name
        },
        setNums(state, data: number[]) {
            state.nums = data
        }
    },
    actions: {
        async setNameAction(ctx, data: { name: string, id: number }) {
            ctx.commit("setName", data)
        },
        async setNumsAction({ commit, dispatch, state, rootGetters }, nums: number[]) {
            commit("setNums", nums)
            return { code: state.name + "dss", ao_li_gei: rootGetters.ao_li_gei }
        }
    }
})

// in other files
const dd = storeModule("dd", {
    namespaced: true,
    state: { count: 3 },
    mutations: {
        increment(state) {
            state.count += 1
        },
        add(state, data: number) {
            state.count += data
        }
    },
    actions: {
        async add({ commit }, nums: Promise<number[]>) {
            let total = (await nums).reduce((acc, n) => acc += n)
            commit("add", total)
            // commit("ss/setName", { name: "ss", id: 0 }) // error, commit 到其他模块，目前无法推导
            commit("ss/setName" as any, { name: "ss", id: 0 }) // any 
        }
    }
})

// in other files
const aa = storeModule("aa", {
    namespaced: true,
    state: { count: 3 },
    mutations: {
        increment(state) {
            state.count += 1
        },
    },
    actions: {}
})

// in other files
declare module './index' {
    interface SStore<T> extends Store<T> {
        getters: Getters
    }
}
interface Getters {
    ao_li_gei: number,
    name: string
}
const getters: GettersRecord = {
    ao_li_gei(state, g) {
        return state.aa.count + 3
    },
    name({ ss, dd }, g) {
        return g.ao_li_gei + ss.name + dd.count
    }
}

// 不支持多层 module，
// 不支持在 module 添加 getters，命名空间的 getters 使用不方便：getters['account/profile']
// 只能在根节点添加 getters
// 不支持根节点添加 state，mutations，actions，必须使用命名空间

// 为了兼容根节点 state，可以在第一个参数传入，根节点对象
const modules = rootModules({ss, dd, aa})

// 为了兼容多层 module，可以手动添加，类型推导是没有的
// modules.dd.modules = { node20: {}, node21: {} }

export const store = new Vuex.Store({
    getters,
    modules,
    plugins: [useSStore]
})

// vue components
class VueTest extends Vue {
    get s1() {
        const a = this.$$store.getters.ao_li_gei
        return this.$$store.state.ss.nums
    }
    async fn1() {
        // 有时候修改了 `actions`，`dispatch` 的类型推导不出来，请关掉 vs code 再打开
        const name = await this.$$store.dispatch(["ss", "setNumsAction"])([2, 3, 3,])
        this.$$store.commit(["ss", "setName"])({ name: "dd", id: 3 })

        this.$$store.commit(["dd", "increment"])()
    }
}

