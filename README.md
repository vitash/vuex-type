# vuex-type

为 vuex 添加类型补充, 对原生的 vue 和 vuex 代码侵入较少，写法和原生的差不多。  
为 vue 使用 store 提供类型覆盖，vuex 编写 module / state / getters 提供类型推导。  
并不能完全推导出 vuex 的所有类型, 而且必须使用命名空间。能用，方便，还行吧。  

[更罗嗦的介绍](https://github.com/vitash/vuex-type/blob/master/assets/Introduction.md)

## 使用例子

### 编写 module
![module.gif](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/module.gif)

### 编写 getters
![getters.gif](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/getters.gif)

### Vue 组件内使用 Store
![vue-components.gif](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/vue-components.gif)

## 类型补充：
- state, 不需要声明 interface, 多层只读, 
- getters, 需要声明 interface, 只支持顶层 getters, 不支持 module 里面添加 getters
- commit / dispatch, 不需要声明 interface, 可以推导出二层命名空间, 参数, 返回值, 不支持多层 module
- module, 提供编写时 module 本身的上下文类型: state / rootState / rootGetters / commit / dispatch

## 类型推导的限制
- 不支持顶层 state / actions / mutations
- 不支持多层 module, 支持一层 module, 而且必须使用命名空间
- 不支持在 module 添加 getters, 只能在根节点添加 getters

## 完整代码用例
``` typescript
import Vue from "vue"
import Vuex, { Store } from "vuex"
import { useSStore, storeModule, State, rootModules, GettersRecord, } from "vuex-type"

declare module "vuex-type" {
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
            state.id = data.id
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
            // commit("ss/setName", { name: "ss", id: 0 }) // type error, commit 到其他模块, 目前无法推导
            // commit("ss/setName" as any, { name: "ss", id: 0 }) // any ok
            this.commit.commit(["ss", "setName"])({ name: "dd", id: 3 }) // ok
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
declare module 'vuex-type' {
    interface SStore<T> extends Store<T> {
        getters: Getters
    }
}
interface Getters {
    ao_li_gei: number,
    name: string,
}
const getters: GettersRecord = {
    ao_li_gei(state, g) {
        
        return state.aa.count + 3
    },
    name({ ss, dd }, g) {
        return g.ao_li_gei + ss.name + dd.count
    },
}

// 不支持多层 module, 
// 不支持在 module 添加 getters, 命名空间的 getters 使用不方便：getters['account/profile']
// 只能在根节点添加 getters
// 不支持根节点添加 state, mutations, actions, 必须使用命名空间

const modules = rootModules({ ss, dd, aa })

// 为了兼容多层 module, 可以手动添加, 类型推导是没有的
// modules.dd.modules = { node20: {}, node21: {} }

Vue.use(Vuex)
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
        // 有时候修改了 `actions`, `dispatch` 的类型推导不出来, 请关掉 vs code 再打开
        const name = await this.$$store.dispatch(["ss", "setNumsAction"])([2, 3, 3,])
        this.$$store.commit(["ss", "setName"])({ name: "dd", id: 3 })

        this.$$store.commit(["dd", "increment"])()
    }
}

```
