class Post {
  constructor(id, title, content) {
    this.id = id;
    this.title = title;
    this.content = content;
  }

  preview() {
    const row = this.content.split('.');
    if (row.length > 1) {
      return this.content.split('.')[0] + '.';
    }
    return this.content;
  }
}



const sample = new Post(
  12,
  'Lorem',
  'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laudantium delectus enim nisi ab ea sint dolorum! Possimus, consequuntur. Autem illum enim ducimus error modi dicta impedit repellendus sunt delectus ut?'
);

console.log(sample.preview());
