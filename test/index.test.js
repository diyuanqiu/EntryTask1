import { schema } from '../src/Entity.js'
import { normalize } from '../src/Normalize.js'
import { denormalize } from '../src/Denormalize.js'

//范式化数据用例，原始数据
const originalData = {
  "id": "123",
  "author": {
    "uid": "1",
    "name": "Paul"
  },
  "title": "My awesome blog post",
  "comments": {
    total: 100,
    result: [{
      "id": "324",
      "commenter": {
        "uid": "2",
        "name": "Nicole"
      }
    }]
  }
}
//范式化数据用例，范式化后的结果数据
const normalizedData = {
  result: "123",
  entities: {
    "articles": {
      "123": {
        id: "123",
        author: "1",
        title: "My awesome blog post",
        comments: {
          total: 100,
          result: ["324"]
        }
      }
    },
    "users": {
      "1": { "uid": "1", "name": "Paul" },
      "2": { "uid": "2", "name": "Nicole" }
    },
    "comments": {
      "324": { id: "324", "commenter": "2" }
    }
  }
}

test('test originalData to normalizedData', () => {
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  });
  const comment = new schema.Entity('comments', {
    commenter: user
  });
  const article = new schema.Entity('articles', {
    author: user,
    comments: {
      result: [comment]
    }
  });
  const data = normalize(originalData, article);
  expect(data).toEqual(normalizedData);
});

test('test normalizedData to originalData', () => {
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  });
  // Define your comments schema
  const comment = new schema.Entity('comments', {
    commenter: user
  });
  // Define your article
  const article = new schema.Entity('articles', {
    author: user,
    comments: {
      result: [comment]
    }
  });
  const data = normalize(originalData, article)
  //还原范式化数据
  const { result, entities } = data;
  const denormalizedData = denormalize(result, article, entities);
  expect(denormalizedData).toEqual(originalData)
})

describe('schema', () => {
  test('可以自定义idAttribute', () => {
    const e = new schema.Entity('users', {}, {
      idAttribute: 'uid'
    })
    expect(normalize({ uid: 1, name: 'steins' }, e)).toEqual({
      result: 1,
      entities: {
        users: {
          1: {
            uid: 1,
            name: 'steins'
          }
        }
      }
    })
  })
})

describe('normalize', () => {
  test('能正常使用 normalize', () => {
    const user = new schema.Entity('users')
    const data = {
      id: 1,
      name: 'steins',
      job: 'FE'
    }
    const normalizeData = normalize(data, user)
    expect(normalizeData).toEqual({
      result: 1,
      entities: {
        users: {
          1: {
            id: 1,
            name: 'steins',
            job: 'FE'
          }
        }
      }
    })
  })

  test('可使用嵌套数据结构', () => {
    const originalData = {
      id: '123',
      author: {
        id: '1',
        name: 'Paul'
      },
      title: 'My awesome blog post',
      comments: [
        {
          id: '324',
          commenter: {
            id: '2',
            name: 'Nicole'
          }
        }
      ]
    }
    const user = new schema.Entity('users')

    const comment = new schema.Entity('comments', {
      commenter: user
    })

    const article = new schema.Entity('articles', {
      author: user,
      comments: [comment]
    })

    expect(normalize(originalData, article)).toEqual({
      result: '123',
      entities: {
        articles: {
          123: {
            id: '123',
            author: '1',
            title: 'My awesome blog post',
            comments: ['324']
          }
        },
        users: {
          1: { id: '1', name: 'Paul' },
          2: { id: '2', name: 'Nicole' }
        },
        comments: {
          324: { id: '324', commenter: '2' }
        }
      }
    })
  })

  test('可使用嵌套数据结构，数组', () => {
    const originalData = [{
      id: '123',
      author: {
        uid: '1',
        name: 'Paul'
      },
      title: 'My awesome blog post',
      comments: {
        total: 100,
        result: [{
          id: '324',
          commenter: {
            uid: '2',
            name: 'Nicole'
          }
        }]
      }
    }]

    const user = new schema.Entity('users', {}, {
      idAttribute: 'uid'
    })

    const comment = new schema.Entity('comments', {
      commenter: user
    })

    const article = new schema.Entity('articles', {
      author: user,
      comments: {
        result: [comment]
      }
    })

    expect(normalize(originalData, [article])).toEqual({
      result: ['123'],
      entities: {
        articles: {
          123: {
            id: '123',
            author: '1',
            title: 'My awesome blog post',
            comments: {
              total: 100,
              result: ['324']
            }
          }
        },
        users: {
          1: { uid: '1', name: 'Paul' },
          2: { uid: '2', name: 'Nicole' }
        },
        comments: {
          324: { id: '324', commenter: '2' }
        }
      }
    })
  })

  test('可使用多层嵌套数据结构', () => {
    const user = new schema.Entity('users')
    const comment = new schema.Entity('comments', {
      user: user,
      star: [user]
    })
    const article = new schema.Entity('articles', {
      author: user,
      comments: [comment]
    })

    const input = {
      id: '123',
      title: 'A Great Article',
      author: {
        id: '8472',
        name: 'Paul'
      },
      body: 'This article is great.',
      comments: [
        {
          id: 'comment-123-4738',
          comment: 'I like it!',
          user: {
            id: '10293',
            name: 'Jane'
          },
          star: [{
            id: '10293',
            name: 'Jane'
          }, {
            id: '10294',
            name: 'steins'
          }]
        }
      ]
    }
    expect(normalize(input, article)).toEqual({
      result: '123',
      entities: {
        articles: {
          123: {
            id: '123',
            title: 'A Great Article',
            author: '8472',
            body: 'This article is great.',
            comments: ['comment-123-4738']
          }
        },
        users: {
          8472: {
            id: '8472',
            name: 'Paul'
          },
          10293: {
            id: '10293',
            name: 'Jane'
          },
          10294: {
            id: '10294',
            name: 'steins'
          }
        },
        comments: {
          'comment-123-4738': {
            id: 'comment-123-4738',
            comment: 'I like it!',
            user: '10293',
            star: ['10293', '10294']
          }
        }
      }
    })
  })
})

describe('denormalize', () => {
  test('能正常使用 denormalize', () => {
    const user = new schema.Entity('users')
    const data = {
      result: 1,
      entities: {
        users: {
          1: {
            id: 1,
            name: 'steins',
            job: 'FE'
          }
        }
      }
    }
    expect(denormalize(data.result, user, data.entities)).toEqual({
      id: 1,
      name: 'steins',
      job: 'FE'
    })
  })

  test('可使用嵌套数据结构', () => {
    const data = {
      result: '123',
      entities: {
        articles: {
          123: {
            id: '123',
            author: '1',
            title: 'My awesome blog post',
            comments: ['324']
          }
        },
        users: {
          1: { id: '1', name: 'Paul' },
          2: { id: '2', name: 'Nicole' }
        },
        comments: {
          324: { id: '324', commenter: '2' }
        }
      }
    }
    const user = new schema.Entity('users')

    const comment = new schema.Entity('comments', {
      commenter: user
    })

    const article = new schema.Entity('articles', {
      author: user,
      comments: [comment]
    })

    expect(denormalize(data.result, article, data.entities)).toEqual({
      id: '123',
      author: {
        id: '1',
        name: 'Paul'
      },
      title: 'My awesome blog post',
      comments: [
        {
          id: '324',
          commenter: {
            id: '2',
            name: 'Nicole'
          }
        }
      ]
    })
  })

  test('可使用嵌套数据结构，数组', () => {
    const data = {
      result: '123',
      entities: {
        articles: {
          123: {
            id: '123',
            author: '1',
            title: 'My awesome blog post',
            comments: {
              total: 100,
              result: ['324']
            }
          }
        },
        users: {
          1: { uid: '1', name: 'Paul' },
          2: { uid: '2', name: 'Nicole' }
        },
        comments: {
          324: { id: '324', commenter: '2' }
        }
      }
    }
    const user = new schema.Entity('users', {}, {
      idAttribute: 'uid'
    })

    const comment = new schema.Entity('comments', {
      commenter: user
    })

    const article = new schema.Entity('articles', {
      author: user,
      comments: {
        result: [comment]
      }
    })

    expect(denormalize(data.result, article, data.entities)).toEqual({
      id: '123',
      author: {
        uid: '1',
        name: 'Paul'
      },
      title: 'My awesome blog post',
      comments: {
        total: 100,
        result: [{
          id: '324',
          commenter: {
            uid: '2',
            name: 'Nicole'
          }
        }]
      }
    })
  })

  test('可使用多层嵌套数据结构', () => {
    const user = new schema.Entity('users')
    const comment = new schema.Entity('comments', {
      user: user,
      star: [user]
    })
    const article = new schema.Entity('articles', {
      author: user,
      comments: [comment]
    })

    const data = {
      result: '123',
      entities: {
        articles: {
          123: {
            id: '123',
            title: 'A Great Article',
            author: '8472',
            body: 'This article is great.',
            comments: ['comment-123-4738']
          }
        },
        users: {
          8472: {
            id: '8472',
            name: 'Paul'
          },
          10293: {
            id: '10293',
            name: 'Jane'
          },
          10294: {
            id: '10294',
            name: 'steins'
          }
        },
        comments: {
          'comment-123-4738': {
            id: 'comment-123-4738',
            comment: 'I like it!',
            user: '10293',
            star: ['10293', '10294']
          }
        }
      }
    }

    expect(denormalize(data.result, article, data.entities)).toEqual({
      id: '123',
      title: 'A Great Article',
      author: {
        id: '8472',
        name: 'Paul'
      },
      body: 'This article is great.',
      comments: [
        {
          id: 'comment-123-4738',
          comment: 'I like it!',
          user: {
            id: '10293',
            name: 'Jane'
          },
          star: [{
            id: '10293',
            name: 'Jane'
          }, {
            id: '10294',
            name: 'steins'
          }]
        }
      ]
    })
  })
})
