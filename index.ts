import Vue from 'vue'
import { Store, MutationTree, GetterTree, ModuleTree, Commit, Dispatch, CommitOptions, DispatchOptions, Module } from 'vuex'

export function useSStore(store: Store<State>) {
    const dispatch_ = store.dispatch.bind(store)
    store.dispatch = function (...arg: any[]) {
        if (arg.length === 1 && Array.isArray(arg[0])) {
            return (data: any) => dispatch_(arg[0].join('/'), data)
        }
        return (dispatch_ as any)(...arg)
    } as any

    const commit_ = store.commit.bind(store)
    store.commit = function (...arg: any[]) {
        if (arg.length === 1 && Array.isArray(arg[0])) {
            return (data: any) => commit_(arg[0].join('/'), data)
        }
        return (commit_ as any)(...arg)
    } as any

    Vue.prototype.$$store = store
}

export function storeModule<
    ModuleKey extends ModulesKeys,
    S,
    Mut extends MutationTree<S>,
    Act extends ActTree<ModuleKey, S, State>,
    >(key: ModuleKey, mod: {
        namespaced: true
        state: S,
        mutations: Mut,
        actions: Act,
        // modules?: ModuleTree<any> /** 类型推导不出来，QAQ */
    }) {
    return (node: Module<any, any>) => {
        if (!!!node.modules) { node.modules = {} }
        node.modules[key] = mod as any
        return mod
    }
}

// export type UseModule = (node: ModuleTree<any>) => any
export function rootModules(root: Module<any, any>, ...mods: Array<(node: Module<any, any>) => any>) {
    mods.forEach(m => m(root));
    return root as { [K in keyof StoreModules]: StoreModules[K] & { modules: ModuleTree<any> } }
}

// (state: State, getters: any) => any, 为什么第二个参数不使用 Getters 类型，因为会发生循环引用，求解 QAQ 。。。
// export function rootGetters(getters: RecordGetters) {
//     return getters
// }

// export function rootGetters3<T extends Array<(state: State, getters: Getters) => any>>(...gettersFn: T) {
    
//     return getters
// }

interface ActTree<Mkey extends ModulesKeys, S, State> {
    // actions 必须是异步函数，如果不是请放到 mutations
    [key: string]: (this: Store<State>, injectee: ActContext<Mkey, S, State>, payload?: any) => Promise<any>;
}
interface ActContext<Mkey extends ModulesKeys, S, R> {
    dispatch: <FnName extends ModulesFnKeys<Mkey, 'actions'>>(type: FnName, ...payload: Parameters<ModulesFn<Mkey, 'actions', FnName>>) => ReturnType<ModulesFn<Mkey, 'actions', FnName>>;
    commit: <FnName extends ModulesFnKeys<Mkey, 'mutations'>>(type: FnName, ...payload: Parameters<ModulesFn<Mkey, 'mutations', FnName>>) => void;
    state: S;
    getters: any;
    rootState: R;
    rootGetters: Getters;
}

type ModulesFnKeys<K1 extends ModulesKeys, K2 extends keyof StoreModules[K1]> = keyof StoreModules[K1][K2]

type ModulesFn<
    K1 extends ModulesKeys,
    K2 extends keyof StoreModules[K1],
    K3 extends keyof StoreModules[K1][K2]
    > =
    StoreModules[K1][K2][K3] extends (state: any, ...data: infer Data) => infer R ?
    (...data: Data) => R : never

export type ModulesKeys = keyof StoreModules
export type RootState = { [K in ModulesKeys]: StoreModules[K]['state'] }
export type State = ReadonlyDeep<RootState>
type Getters = Readonly<SStore<State>['getters']>
export type RecordGetters = { [K in keyof Getters]: (state: State, getters: Getters) => Getters[K] }

/** getters 不会对 Promise 解包，所以不要在 getters 里面写异步函数 */
export type ExtractGetters<G extends Record<keyof any, (...args: any) => any>> = { readonly [K in keyof G]: ReturnType<G[K]> }
export type ReadonlyDeep<T> = { readonly [K in keyof T]: T[K] extends Object ? ReadonlyDeep<T[K]> : T[K] }
// type PromiseUnwrap<T extends (...args: any) => any> = T extends (...arg: any[]) => Promise<infer U> ? U : ReturnType<T>

export interface StoreModules { }
export interface SStore<T> extends Store<T> { }

declare module 'vue/types/vue' {
    interface Vue {
        $$store: SStore<State>;
    }
}

declare module 'vuex/types/index' {
    interface Dispatch {
        <MKey extends ModulesKeys, FnName extends keyof StoreModules[MKey]['actions']>(names: [MKey, FnName]):
            ModulesFn<MKey, 'actions', FnName>
    }
    interface Commit {
        <MKey extends ModulesKeys, FnName extends keyof StoreModules[MKey]['mutations']>(names: [MKey, FnName]):
            (...data: Parameters<ModulesFn<MKey, 'mutations', FnName>>) => void
    }
}
