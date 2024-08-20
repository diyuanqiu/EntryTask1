/**
 * 判断 Entity 是否为 schema
 * @param data 传入的原始数据
 * @param schema 传入的实体部分
 * @param addEntity 添加实体属性的方法
 * @param processedEntities 已经访问过的实体
 * @returns {*[]|*}
 */
const flatten = (data, schema, addEntity, processedEntities) => {

    // 判断符不符合Entity定义
    if(typeof schema.getName !== 'undefined') {
        return SchemaNormalize(data, schema, addEntity, processedEntities);
    } else {
        // 实体是对象或数组
        return notSchemaNormalize(data, schema, addEntity, processedEntities);
    }
};

/**
 * Entity 为 schema 时的处理方法， 递归地处理 schema， 保证嵌套的 schema 能被处理
 * @param data 传入的原始数据
 * @param schema 传入的实体部分
 * @param addEntity 添加实体属性的方法
 * @param processedEntities 已经访问过的实体
 * @returns {*}
 */
const SchemaNormalize = (data, schema, addEntity, processedEntities) => {

    const item = schema.getId(data);
    if (processedEntities.has(item)) {
        return item;
    }

    const processEntity = {...data};
    processedEntities.add(item); // 标记为已处理

    Object.keys(schema.schema).forEach((key) => {
        const temp = flatten(processEntity[key], schema.schema[key], addEntity, processedEntities);
        if(temp) {
            processEntity[key] = temp;
        }
    });

    addEntity(schema, processEntity);

    return schema.getId(data);
}

/**
 * Entity 为数组或对象时的处理方法
 * @param data 传入的原始数据
 * @param schema 传入的实体部分
 * @param addEntity 添加实体属性的方法
 * @param processedEntities 已经访问过的实体
 * @returns {*}
 */
const notSchemaNormalize = (data, schema, addEntity, processedEntities) => {
    // 可能是数组或者对象
    const currentObj = { ...data };
    const currentArr = [];
    const isArray = schema instanceof Array;
    Object.keys(schema).forEach(key => {
        if (isArray) {
            // 针对数组类型schema进行循环
            data.forEach((childData) => {
                const temp = flatten(childData, schema[key], addEntity, processedEntities);
                currentArr.push(temp);
            })
        } else {
            currentObj[key] = flatten(data[key], schema[key], addEntity, processedEntities);
        }
    })
    if (isArray) {
        return currentArr;
    } else {
        return currentObj;
    }
};

/**
 * 在entities中添加属性的方法
 * @param entities entities键
 * @returns {(function(*, *): void)|*}
 */
const addEntity = (entities) => {
    return (schema, processEntity) => {
        const key = schema.getName();
        const id = schema.getId(processEntity);
        if (!(key in entities)) {
            entities[key] = {};
        }
        const currentEntity = entities[key][id];
        if (currentEntity) {
            // 添加属性
            entities[key][id] = Object.assign(currentEntity, processEntity);
        } else {
            entities[key][id] = processEntity;
        }
    }
}

/**
 * 暴露给外部使用的normalize方法
 * @param data 传入的原始数据
 * @param schema 实体
 * @returns {{result: (*[]|*), entities: {}}}
 */
export function normalize(data, schema) {

    const entities = {};
    const add = addEntity(entities);
    const processedEntities = new Set();
    const result = flatten(data, schema, add, processedEntities);
    return {
        result,
        entities
    }
}