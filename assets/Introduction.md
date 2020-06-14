# 为心爱的 Vuex 添加类型声明补充
虽然 Vuex 支持了 TypeScript，但是好几处地方都没有类型覆盖到，用起来有些难受，所以做一下类型补充。
覆盖到 Vue 组件内使用 Store 的类型，而且提供了 mudule 的上下文类型推导，不需要自己声明 interface。

## mudule 的编写和类型推导
编写起来和 Js 差不多，“成功的把 Ts 写成了 Js”，还有类型约束的那种。具体表现为不需要为 `state` 声明 interface，
`commit` 自动推导出 `mutation` 的函数名，并且推导出参数和返回值。  
![module](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/i-module.gif)  
![module-commit](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/i-module-commit.gif)  
![module-state](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/i-module-state.gif)  
![module-merge](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/i-module-merge.gif)  
把所有的 module 类型添加到 vuex-type 里面进行声明合并，只有这样才能使用类型推导，不然就报错了  
![module-MKey](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/i-module-MKey.gif)  

欠缺：目前的类型推导必须使用命名空间，`module` 里面不能再嵌套 `module` 了，所以只能有一层 `module`。

## 编写 getters
`getters` 需要声明 interface，不能使用自动推导了，写起来还是很舒服的，类型提示都有。  
![getters](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/getters.gif)

欠缺：目前只能再根节点添加 `getters` ，原 `Vuex` 是可以使用命名空间，而且在每个 `module` 都可以添加 `getters`，
但我发现使用起来太麻烦，如：`getters['account/profile']`，这个还要手动拼接命名空间字符串，还是不支持的好，直接在根节点添加。

## Vue 组件内的使用
类型覆盖差不多了，`state`, `getters`, `commit`, `dispatch`，都是强类型的，有只读约束，调用参数和返回值提示。
没有使用装饰器，反正类型都覆盖到了，直接写出来就好了。  
![vue-components1](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/i-components1.gif)

`commit`, `dispatch` 的第一个参数是一个元组 `[module_key, method_name]`，这样是为了方便函数重载，
因为 vuex 原本也带了两个重载，调用该版本的重载会返回一个新的函数，函数参数就是 module 里面方法的 payload 参数，也就是第二个参数。
参数类型都是推导出来的，返回值也是。  
![components-commit](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/i-components2.gif)  
![components-dipatch](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/i-components3.gif)

欠缺：`commit`, `dispatch` 只能使用两层命名空间，这个是写死的元组类型 `[module_key, method_name]`，
也就为什么只能使用一层 `module`，不能再嵌套多层 `module`。还有一个重要的问题：转到方法定义，
这是一个重要的需求，但是 TypeScript 没有提供，通过函数参数可以跳过去，但是不能通过 `[module_key, method_name]` 这个字面量跳过去。  
![method-goto-defintion](https://raw.githubusercontent.com/vitash/vuex-type/master/assets/i-method-goto-defintion.gif)

## 关于它
Vuex 虽然写了类型，却没有很好的覆盖到使用上，出现了类型的断层，各种莫名其妙的字符串毫无约束，这是不能忍的。
该库也只是对原 Vuex 多做一些声明，对代码的侵入和改动很小，一个是添加了 vuex 的 `commit`, `dispatch` 的方法重载，
还有一个是对 vue 添加新的的属性 `$$store`，原生的 `$store` 还在，两个都是同一个对象，这些都是为了类型覆盖到。
最有趣的地方就是 `storeModule` 的类型推导，不需要写声明很多接口就实现了。同时该库也阉割了一些 vuex 的功能，先用着吧。

具体类型声明和实现 100 来行，想要了解更多细节直接看代码吧：  
[git: vuex-type](https://github.com/vitash/vuex-type)  
[npm: vuex-type](https://www.npmjs.com/package/vuex-type)  



