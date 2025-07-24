import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { onError } from "@apollo/client/link/error";

const httpLink = createHttpLink({
    uri: "http://localhost:8080/graphql",
    credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('authToken');

    return {
        headers: {
            ...headers,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
    };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
            console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`);
        });
    }

    if (networkError) {
        console.error(`Network error:`, networkError);

        if (networkError.statusCode === 401) {
            // Token might be expired, redirect to login
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
    }
});

const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            errorPolicy: "all",
        },
        query: {
            errorPolicy: "all",
        },
    },
});

export default client;