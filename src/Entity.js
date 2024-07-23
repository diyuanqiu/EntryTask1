class Entity{
    constructor(name, entityParams = {}, entityConfig = {}){

        this.name = name;
        this.entityParams = entityParams;
        this.entityConfig = entityConfig;

        // idAttribute 默认值为字符串'id'
        this.idAttribute = entityConfig.idAttribute || 'id';
        this.init(entityParams)
    }

    getName(){
        return this.name;
    }

    getId(input){
        return input[this.idAttribute];
    }

    // 初始化entity
    init (entityParams) {
        if (!this.schema) this.schema = {}
    
        for (const key in entityParams) {
          if (entityParams.hasOwnProperty(key)) {
            this.schema[key] = entityParams[key]
          }
        }
    }
}

// 暴露Entity方法
export const schema = {
    Entity,
}