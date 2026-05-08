import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
});

async function createSchema() {
  try {
    await client.schema.classCreator()
      .withClass({
        class: 'Image',
        vectorizer: 'none',
        properties: [
          { name: 'title', dataType: ['text'] },
          { name: 'imageUrl', dataType: ['text'] },
        ],
      })
      .do();
    console.log('Schema created!');
  } catch (err) {
    console.error(err);
  }
}

createSchema();