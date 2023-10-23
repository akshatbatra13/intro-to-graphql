const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString, GraphQLID } = require('graphql')
const _ = require('lodash');

const app = express();

const books  = [
    { id: '1', title: 'book-1', author: 'author-1' },
    { id: '2', title: 'book-2', author: 'author-2' },
    { id: '3', title: 'book-3', author: 'author-3' },
]

const bookType = new GraphQLObjectType(
    {
        name: "Book",
        fields: {
            id: { type: GraphQLID },
            title: { type: GraphQLString },
            author: { type: GraphQLString }
        }
    }
);

const RootQuery = new GraphQLObjectType({
    name: 'Query',
    fields: {
      books: {
        type: new GraphQLList(BookType),
        resolve: () => books,
      },
      allBooks: {
        type: new GraphQLList(BookType),
        resolve: () => books,
      },
      booksByTitle: {
        type: new GraphQLList(BookType),
        args: { title: { type: GraphQLString } },
        resolve: (parent, args) => books.filter((book) => book.title.toLowerCase() === args.title.toLowerCase()),
      },
      booksByAuthor: {
        type: new GraphQLList(BookType),
        args: { author: { type: GraphQLString } },
        resolve: (parent, args) => books.filter((book) => book.author.toLowerCase() === args.author.toLowerCase()),
      },
      bookById: {
        type: BookType,
        args: { id: { type: GraphQLID } },
        resolve: (parent, args) => _.find(books, { id: args.id }),
      },
      booksByTitleAndAuthor: {
        type: new GraphQLList(BookType),
        args: { title: { type: GraphQLString }, author: { type: GraphQLString } },
        resolve: (parent, args) => {
          return books.filter(
            (book) =>
              book.title.toLowerCase() === args.title.toLowerCase() &&
              book.author.toLowerCase() === args.author.toLowerCase()
          );
        },
      },
    },
  });
  
  
  const RootMutation = new GraphQLObjectType({
    name: 'mutation',
    fields: {
      addBook: {
        type: BookType,
        args: { title: { type: GraphQLString }, author: { type: GraphQLString } },
        resolve: (parent, args) => {
          const book = { id: String(books.length + 1), title: args.title, author: args.author };
          books.push(book);
          return book;
        },
      },
      deleteBook: {
        type: BookType,
        args: { id: { type: GraphQLID } },
        resolve: (parent, args) => {
          const removedBook = _.remove(books, (book) => book.id === args.id)[0];
          return removedBook;
        },
      },
    },
  });
  
  const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
  });
  
  app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));
  app.listen(4000, () => {
    console.log('GraphQL server is running on http://localhost:4000/graphql');
  });