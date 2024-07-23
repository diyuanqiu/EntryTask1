// Entity 为数组或对象时的处理方法
const notSchemaNormalize = (result, schema, unflatten) => {
    // 可能是数组或者对象
    const currentObj = { ...result }
    const currentArr = []
    const isArray = schema instanceof Array
    Object.keys(schema).forEach(key => {
        if (isArray) {
            Object.keys(currentObj).forEach((childKey) => {
              currentArr.push(unflatten(currentObj[childKey], schema[key]))
            })
        } else if (currentObj[key]) {
            currentObj[key] = unflatten(currentObj[key], schema[key])
        }
    })
    if (isArray) {
        return currentArr
    } else {
        return currentObj
    }
}

// Entity 为schema时的处理方法
const isSchemaNormalize = (id, schema, unflatten, getEntity, store) => {
    const entity = getEntity(id, schema)
    // schema 的名称
    const key = schema.getName()
    if(!store[key]){
        store[key] = {}
    }
    if(!store[key][id]){
        const processedEntity = {...entity}
        Object.keys(schema.schema).forEach((key) => {
            if(processedEntity.hasOwnProperty(key)){
                processedEntity[key] = unflatten(processedEntity[key], schema.schema[key])
            }
        })
        store[key][id] = processedEntity
    }
    return store[key][id]
}

// 得到反范式化的数据
const getUnFlatten = (entities) => {
    const store = {}
    const entity = getEntity(entities)
    // 判断 Entity 是否为 schema
    return function unflatten(result, schema){
        if(typeof schema.getName === 'undefined') {
            return notSchemaNormalize(result, schema, unflatten)
        }
        // store: 临时保存Entity反范式化后的数据
        return isSchemaNormalize(result, schema, unflatten, entity, store)
    }
}

// 根据id获取schema对应的对象
const getEntity = (entities) => {
    return (entityId, schema) => {
        const key = schema.getName()
        // 对应的对象可能也是一个schema
        if (typeof entityId === 'object' && entityId !== null){
            return entityId
        }
        return entities[key][entityId]
    }
}

export function denormalize(result, schema, entities) {
    return getUnFlatten(entities)(result, schema)
}