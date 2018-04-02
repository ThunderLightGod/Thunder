import Component from './notification.vue'

const NotificationConstructor = Vue.extend(Component)
const instances = []
let seed = 1

const removeInstance = (instance) => {
    const len = instances.length
    if (!instance) {
        return
    }
    const index = instances.findIndex(inst => instance.id === inst.id)
    instances.splice(index, 1)

    if (len <= 1) {
        return
    }
    const removeHeight = instance.vm.removeHeight
    for (let i = index; i < len - 1; i++) {
        instances[i].verticalOffset = parseInt(instances[i].verticalOffset) - removeHeight - 16
    }
}

const notify = function (options) {
    const {
        onClose,
        ...rest
    } = options
    if (Vue.prototype.$isServer) {
        return
    }
    options = options || {}
    const id = `notification_${seed++}`
    const instance = new NotificationConstructor({
        propsData: {
            ...rest
        }
    })

    instance.id = id
    instance.vm = instance.$mount()
    document.body.appendChild(instance.vm.$el)
    instance.vm.visible = true

    let verticalOffset = 0
    instances.forEach(item => {
        verticalOffset += item.$el.offsetHeight + 16
    })
    verticalOffset += 16
    instance.verticalOffset = verticalOffset
    instance.vm.$on('closed',() => {
        if (typeof onClose === 'function') {
            onClose(instance)
        }
        removeInstance(instance)
        instance.vm.$destroy()
    })
    return instance.vm
}

export default notify