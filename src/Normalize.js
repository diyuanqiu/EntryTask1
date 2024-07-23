// 判断 Entity 是否为 schema
const flatten = (data, schema, addEntity) => {

    if(typeof schema.getName !== 'undefined') {
        return isSchemaNormalize(data, schema, addEntity)
    } else {
        // 实体是对象或数组
        return notSchemaNormalize(data, schema, addEntity)
    }
}

// Entity 为 schema 时的处理方法
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

// Entity 为数组或对象时的处理方法
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

// 在entities中添加Entity的方法
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

export function normalize(data, schema) {

    const entities = {};
    const add = addEntity(entities);
    const result = flatten(data, schema, add);
    return {
        result,
        entities
    }
}