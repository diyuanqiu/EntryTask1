/**
 * Entity 为数组或对象时的处理方法
 * @param result 传入的部分范式化后的数据
 * @param schema 传入的实体部分
 * @param unflatten 反范式化函数
 * @returns {*}
 */
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

/**
 * Entity 为schema时的处理方法
 * @param id 用于索引的id
 * @param schema
 * @param unflatten
 * @param getEntity 获取对应entity内容的函数
 * @param store 用于临时存储的数据
 * @returns {*}
 */
const SchemaNormalize = (id, schema, unflatten, getEntity, store) => {
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

/**
 * 得到反范式化的数据
 * @param entities
 * @returns {(function(*, *): (*))|*}
 */
const getUnFlatten = (entities) => {
    const store = {}
    const entity = getEntity(entities)
    // 判断 Entity 是否为 schema
    return function unflatten(result, schema){
        if(typeof schema.getName === 'undefined') {
            return notSchemaNormalize(result, schema, unflatten)
        }
        // store: 临时保存Entity反范式化后的数据
        return SchemaNormalize(result, schema, unflatten, entity, store)
    }
}

/**
 * 根据id获取schema对应的对象
 * @param entities
 * @returns {(function(*, *): (*))|*}
 */
const getEntity = (entities) => {
    return (entityId, schema) => {
        const key = schema.getName()
        return entities[key][entityId]
    }
}

/**
 * 暴露给外部使用的denormalize函数
 * @param result
 * @param schema
 * @param entities
 * @returns {*}
 */
export function denormalize(result, schema, entities) {
    return getUnFlatten(entities)(result, schema)
}
