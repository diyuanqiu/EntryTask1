class Entity{

    /**
     * entity的构造
     * @constructor
     */
    constructor(name, entityParams = {}, entityConfig = {}){

        this.name = name;
        // idAttribute 默认值为字符串'id'
        this.idAttribute = entityConfig.idAttribute || 'id';
        this.init(entityParams)
    }

    /**
     * 获取entity的名称
     */
    getName(){
        return this.name;
    }

    /**
     * 获取entity的id
     * @param input
     * @returns {*}
     */
    getId(input){
        return input[this.idAttribute];
    }

    /**
     * 初始化entity, 可能有schema嵌套
     * @param entityParams
     */
    init (entityParams) {
        if (!this.schema) this.schema = {}
    
        for (const key in entityParams) {
          if (entityParams.hasOwnProperty(key)) {
            this.schema[key] = entityParams[key]
          }
        }
    }
}

/**
 * 暴露出schema.Entity方法
 * @type {{Entity: Entity}}
 */
export const schema = {
    Entity,
}