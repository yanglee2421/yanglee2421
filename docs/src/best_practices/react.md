# React

## Hooks

### useActionState

垃圾, 和RSC沾边的基本都是垃圾

### useCallback

写库用, 启用react-compiler的情况下基本感受不到它的存在

### useContext

写库用, 被`React.use`全方位替代, 写库为了兼容17 18时使用

### useDebugValue

调试用, 基本用不着

### useDeferredValue

良, 需要状态的变化触发`Transition`时使用

### useEffect

基建, 向外输出`state`以控制外部和订阅外部事件时使用

### useEffectEvent

基建, 与`useEffect`配套, 希望在effect中忽略某些状态时使用

### useId

基建, 返回的ID在整个React应用中唯一

### useImperativeHandle

基建,

### useInsertionEffect

写库用, 触发于组件生成的DOM插入到组件树之后，布局发生之前

### useLayoutEffect

写库用, 触发于组件生成的DOM发生布局之后, `useEffect`调用之前

## Components
