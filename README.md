## Shopeelize
shopeelize库是为了将嵌套对象范式化，或者将范式化的数据还原成嵌套对象的方法。
## 项目运行方式  
git clone 项目到本地目录
### 项目依赖安装  
npm install  
### 项目测试运行  
npm run test  
### 项目示例代码  
node index.js
## 参数说明  
### schema.Entity(name, [entityParams], [entityConfig])
* Entity的实例为一个schema
* name为该schema的名称
* entityParams为可选参数，定义该schema的外键，定义的外键可以不存在
* entityConfig为可选参数，目前仅支持一个参数  
  * idAttribute，定义该entity的主键，默认值为字符串'id'  
### normalize(data, entity)
* data
  * 需要范式化的数据，必须为符合 schema 定义的对象或由该类对象组成的数组
* entity
  * Entity实例，代表schema，当表示方式为[entity]时则表示该schema为符合entity结构的对象组成的数组
### denormalize (normalizedData, entity, entities)
* normalizedData
  * 需要反范式化的数据，id的数组
* entity
  * 同上文
* entities
  * 范式化后的数据对象
