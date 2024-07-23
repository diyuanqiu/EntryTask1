/**
 * 判断 Entity 是否为 schema
 * @param data 传入的部分originalData
 * @param schema 传入的实体部分
 * @param addEntity 添加实体属性的方法
 * @returns {*[]|*}
 */
const flatten = (data, schema, addEntity) => {

    if(typeof schema.getName !== 'undefined') {
        return isSchemaNormalize(data, schema, addEntity)
    } else {
        // 实体是对象或数组
        return notSchemaNormalize(data, schema, addEntity)
    }
}

/**
 * Entity 为 schema 时的处理方法， 递归地处理 schema， 保证嵌套的 schema 能被处理
 * @param data 传入的部分originalData
 * @param schema 传入的实体部分
 * @param addEntity 添加实体属性的方法
 * @returns {*}
 */
const isSchemaNormalize = (data, schema, addEntity) => {

    const processedEntity = {...data}

    Object.keys(schema.schema).forEach((key) => {
        const temp = flatten(processedEntity[key], schema.schema[key], addEntity)
        if(temp !== undefined) {
            processedEntity[key] = temp
        }
    })

    addEntity(schema, processedEntity)

    return schema.getId(data)
}

/**
 * Entity 为数组或对象时的处理方法
 * @param data 传入的部分originalData
 * @param schema 传入的实体部分
 * @param addEntity 添加实体属性的方法
 * @returns {*}
 */
const notSchemaNormalize = (data, schema, addEntity) => {
    // 可能是数组或者对象
    const currentObj = { ...data }
    const currentArr = []
    const isArray = schema instanceof Array
    Object.keys(schema).forEach(key => {
        if (isArray) {
            // 保证key存在
            if (data && Array.isArray(data)) {
                // 针对数组类型schema进行循环
                data.forEach((childData) => {
                    const temp = flatten(childData, schema[key], addEntity)
                    currentArr.push(temp)
                })
            }
        } else {
            currentObj[key] = flatten(data[key], schema[key], addEntity)
        }
    })
    if (isArray) {
        return currentArr
    } else {
        return currentObj
    }
}

/**
 * 在entities中添加属性的方法
 * @param entities entities键
 * @returns {(function(*, *): void)|*}
 */
const addEntity = (entities) => {
    return (schema, processedEntity) => {
        const key = schema.getName();
        const id = schema.getId(processedEntity);
        if (!(key in entities)) {
            entities[key] = {}
        }
        const currentEntity = entities[key][id]
        if (currentEntity) {
            entities[key][id] = Object.assign(currentEntity, processedEntity)
        } else {
            entities[key][id] = processedEntity
        }
    }
}

/**
 * 暴露给外部使用的normalize方法
 * @param data 输入的originalData
 * @param schema 给定的规则schema
 * @returns {{result: (*[]|*), entities: {}}}
 */
export function normalize(data, schema) {

    const entities = {};
    const add = addEntity(entities);
    const result = flatten(data, schema, add);
    return {
        result,
        entities
    }
}